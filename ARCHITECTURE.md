# Arquitetura — Clima Tempo

## 1. Visão Geral

Aplicação web **multi-página (MPA)** responsiva de previsão do tempo. Cada página é um HTML independente que consome APIs públicas e compartilha dados via `localStorage`. Sem backend próprio.

```
┌──────────────┐
│  index.html  │ ──┐
│  (home)      │   │
└──────────────┘   │   ┌──────────────────────┐
                   ├──▶│  Open-Meteo           │
┌──────────────┐   │   │  ├ Geocoding API      │
│ details.html │ ──┤   │  └ Weather API        │
│ (horário)    │   │   └──────────────────────┘
└──────────────┘   │
                   │   ┌──────────────────────┐
┌──────────────┐   │   │  Nominatim (OSM)     │
│ favorites.html│ ──┼──▶│  reverse geocode     │
└──────────────┘   │   └──────────────────────┘
                   │
┌──────────────┐   │   ┌──────────────────────┐
│ config.html  │ ──┘   │  localStorage         │
│ (tema/unid.) │       │  (store.js)           │
└──────────────┘       └──────────────────────┘
```

### Fluxo de dados entre páginas

```
Query params na URL (lat, lon, name, country)
  Home ←─────────────→ Detalhes
  Home ←─────────────→ Favoritos
  Detalhes ←─────────→ Favoritos

localStorage (store.js)
  Home/Favoritos → localStorage.set → persistência
  Favoritos/Detalhes/Home → localStorage.get → leitura
  Config → localStorage.set → tema e unidade
```

## 2. Organização do Código

```
WeatherApp/
├── index.html              # Home — busca + clima atual + 7 dias + ações
├── details.html            # Detalhes — previsão horária 24h + gráfico canvas
├── favorites.html          # Favoritos — lista de cidades salvas
├── config.html             # Configurações — tema e unidade
├── css/
│   ├── style.css           # Base: nav, variáveis CSS, tema escuro, botões
│   ├── details.css         # Tabela horária, grid de detalhes, gráfico
│   ├── favorites.css       # Cards de cidades favoritas
│   └── config.css          # Formulário de configuração
├── js/
│   ├── utils.js            # WMO codes, getWeatherInfo, formatDate, debounce
│   ├── api.js              # Chamadas HTTP: Geocoding, Weather, Nominatim
│   ├── store.js            # localStorage: favoritos, config, tema
│   ├── ui.js               # Renderização DOM da home (loading, error, weather, forecast, suggestions)
│   └── pages/
│       ├── home.js         # Orquestrador da home: autocomplete, geolocation, favoritos, query params
│       ├── details.js      # Orquestrador dos detalhes: dados horários, tabela, gráfico canvas
│       ├── favorites.js    # Lista de favoritos com atalhos para home/detalhes
│       └── config.js       # Formulário de configuração (tema, unidade)
├── README.md
└── ARCHITECTURE.md
```

### Responsabilidades

| Arquivo | Responsabilidade |
|---------|-----------------|
| `utils.js` | Constantes WMO, funções puras (formatação de data, debounce) |
| `api.js` | Camada HTTP — isola `fetch`, parsing, erros de rede. Mudar de API = mexer só aqui |
| `store.js` | `localStorage` — CRUD de favoritos, config, `applyTheme()` |
| `ui.js` | DOM da home — loading, erro, clima atual, previsão 7 dias, autocomplete |
| `pages/home.js` | Glue code da home — eventos, autocomplete, geolocation, query params, favoritos |
| `pages/details.js` | Carrega dados horários, renderiza tabela e gráfico canvas |
| `pages/favorites.js` | Lê `store.getFavorites()`, renderiza cards, navegação |
| `pages/config.js` | Lê/salva `store.getConfig()` / `store.setConfig()` |

## 3. Consumo de APIs

| API | Endpoint | Uso |
|-----|----------|-----|
| Geocoding | `GET /v1/search?name={cidade}&count=5` | Autocomplete + busca de cidade |
| Weather | `GET /v1/forecast?latitude={lat}&longitude={lon}&current=...&daily=...` | Clima atual + 7 dias |
| Weather | `GET /v1/forecast?latitude={lat}&longitude={lon}&hourly=...&forecast_hours=24` | Previsão horária (detalhes) |
| Nominatim | `GET /reverse?lat={lat}&lon={lon}&format=json` | Reverse geocode para geolocalização |

### Tratamento de erros
- **Rede**: `fetch` lança erro em rede offline, capturado com `try/catch`
- **HTTP não-2xx**: mensagem amigável ao usuário
- **Cidade não encontrada**: validação no JSON de resposta (array vazio)
- **Geolocalização**: mensagens específicas por código de erro (permissão negada, timeout, indisponível)

## 4. Escalabilidade

### Front-end (MPA)
- **CDN**: assets estáticos (HTML, CSS, JS, imagens) servidos via CDN (Cloudflare, CloudFront) — cada página é um arquivo HTML independente, cacheável por URL
- **Cache de API**: respostas do Open-Meteo cacheadas no navegador via `Cache-Control` e Service Worker futuramente
- **Lazy loading**: páginas carregam sob demanda (navegação nativa do navegador)

### Se houvesse backend
- Cache Redis para respostas de APIs externas (TTL de 30min)
- Rate limiting por IP
- Backend stateless em containers (ECS/K8s) com auto-scaling

### Dados
- Open-Meteo: gratuito, sem chave, até 10.000 req/dia. Para escala maior: cache próprio ou plano pago
- Nominatim: limite de 1 req/s. Para produção, alternativas: Google Geocoding, Mapbox

## 5. Banco de Dados

### Persistência atual
`localStorage` no navegador via `store.js`:

```
localStorage
├── clima_favoritos: [
│     { id, name, country, latitude, longitude }
│   ]
└── clima_config: {
      unit: "celsius" | "fahrenheit",
      theme: "auto" | "light" | "dark"
    }
```

### Se houvesse necessidade de backend (favoritos entre dispositivos, histórico):
```
┌────────────────────────────────────────────────┐
│ PostgreSQL (relacional)                        │
│                                                 │
│ usuarios: id, email, senha_hash, created_at     │
│ favoritos: id, user_id, cidade, lat, lon        │
│ historico: id, user_id, cidade, dados_json, ts  │
└────────────────────────────────────────────────┘
```
- **PostgreSQL** escolhido por: maturidade, JSONB para dados semi-estruturados, índices GIN para busca textual
- Alternativa: **SQLite** (embarcado) para modo offline-first

## 6. Segurança

### Front-end (MPA)
- **CSP** (Content-Security-Policy) no `<meta>` ou header HTTP para mitigar XSS
- **Sanitização** de input do usuário antes de enviar para APIs (`encodeURIComponent`)
- **HTTPS** obrigatório (Open-Meteo e Nominatim só aceitam HTTPS)
- Sem chaves/segredos no client-side (nenhuma API requer key)
- **`rel="noopener"`** em links externos

### Se houvesse backend
- Autenticação: JWT com refresh token em httpOnly cookie
- Rate limiting por IP (nginx ou express-rate-limit)
- Helmet.js para headers de segurança
- Validação de input no server (OWASP Top 10)
- Criptografia de senhas com bcrypt (cost 12)
- Prepared statements para queries SQL

## 7. Nuvem (Cloud)

### Arquitetura proposta para produção com backend

```
Cloudflare DNS
    │
    ▼
CloudFront / CDN ──▶ S3 (static assets: HTML, CSS, JS)
    │
    ▼
ALB ──▶ ECS Fargate (containers Node.js)
           │
           ├── Redis ElastiCache (cache de APIs externas)
           └── RDS PostgreSQL (dados persistentes)
```

| Serviço | Função | Justificativa |
|---------|--------|---------------|
| **CloudFront** | CDN | Distribuição global, baixa latência, SSL automático, cache de HTML/CSS/JS |
| **S3** | Static hosting | Armazenamento barato, versionamento de assets, integração com CloudFront |
| **ECS Fargate** | Backend API | Serverless containers, sem gerenciar servidores, auto-scaling |
| **ElastiCache Redis** | Cache | Respostas de API externa em memória (~sub-ms), TTL configurável |
| **RDS PostgreSQL** | Dados persistentes | Multi-AZ, backup automático, escalável até 16TB, read replicas |
| **Route53** | DNS | Health checks, failover geográfico |

### Escalabilidade na nuvem
- **Auto-scaling**: ECS Service Auto Scaling baseado em CPU ou RequestCount
- **Multi-AZ**: RDS e ECS distribuídos em 3 availability zones
- **Read replicas**: RDS read replicas para queries de histórico e favoritos
- **Caching em 3 níveis**: CDN (edge) → Redis (app) → Browser Cache API + localStorage (client)
- **Deploy estático**: como MPA, cada página HTML pode ser deployada independentemente no S3/CloudFront

## 8. Mobile

CSS responsivo (mobile-first, breakpoint 480px) com `backdrop-filter` e glassmorphism. A nav bar se adapta com espaçamento menor em telas pequenas.

Para experiência nativa:
- **PWA**: `manifest.json` + Service Worker permitem instalação no home screen e cache offline
- **React Native / Expo**: reuso da lógica JS (api.js, utils.js, store.js) com componentes nativos
