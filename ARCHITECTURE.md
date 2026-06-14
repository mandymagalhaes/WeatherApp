# Arquitetura — WeatherApp

## 1. Visão Geral

Aplicação web **multi-página (MPA)** responsiva de previsão do tempo com fundo cinematográfico (Terra da órbita via CSS gradients) e glassmorphism. Cada página é um HTML independente que consome APIs públicas e compartilha dados via `localStorage`. Sem backend próprio.

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
                    │   ┌──────────────────────┐
                    └──▶│  localStorage         │
                        │  (store.js)           │
                        └──────────────────────┘
```

### Fluxo de dados entre páginas

```
Query params na URL (lat, lon, name, country)
  Home ←─────────────→ Detalhes
  Home ←─────────────→ Favoritos
  Detalhes ←─────────→ Favoritos

sessionStorage (fallback)
  Home → sessionStorage.setItem('lastCity')
  Detalhes → sessionStorage.getItem('lastCity') se sem query params
  Home → sessionStorage.getItem('lastCity') se sem query params

localStorage (store.js)
  Home/Favoritos → localStorage.set → persistência de favoritos
  Favoritos/Detalhes/Home → localStorage.get → leitura de favoritos
```

## 2. Organização do Código

```
WeatherApp/
├── index.html              # Home — busca + clima atual + 7 dias + ações
├── details.html            # Detalhes — previsão horária 24h + gráfico canvas
├── favorites.html          # Favoritos — lista de cidades salvas
├── css/
│   ├── style.css           # Base: nav, variáveis CSS, fundo Terra da órbita,
│   │                       #   glassmorphism (blur 30px + saturação 180%),
│   │                       #   botões, detalhes climáticos como cards,
│   │                       #   previsão 7 dias com scroll, responsivo 480px
│   ├── details.css         # Header, card atual, grid de cards climáticos,
│   │                       #   tabela horária, gráfico canvas, responsivo
│   └── favorites.css       # Cards de cidades favoritas com glassmorphism
├── js/
│   ├── utils.js            # WMO codes, getWeatherInfo, formatDate, debounce
│   ├── api.js              # Chamadas HTTP: Geocoding, Weather, Nominatim
│   ├── store.js            # localStorage: favoritos, tema
│   ├── theme.js            # Engine de cores de acento dinâmicas por clima
│   ├── ui.js               # Renderização DOM da home (loading, error, weather,
│   │                       #   forecast, suggestions)
│   └── pages/
│       ├── home.js         # Orquestrador da home: autocomplete, geolocation,
│       │                   #   favoritos, query params, sessionStorage
│       ├── details.js      # Orquestrador dos detalhes: dados horários,
│       │                   #   tabela, gráfico canvas (temperatura + sensação)
│       └── favorites.js    # Lista de favoritos com atalhos para home/detalhes
├── README.md
└── ARCHITECTURE.md
```

### Responsabilidades

| Arquivo | Responsabilidade |
|---------|-----------------|
| `utils.js` | Constantes WMO, funções puras (formatação de data, debounce) |
| `api.js` | Camada HTTP — isola `fetch`, parsing, erros de rede. Mudar de API = mexer só aqui |
| `store.js` | `localStorage` — CRUD de favoritos, tema |
| `theme.js` | `THEME.apply(code)` — define `--accent` e variáveis CSS conforme código WMO + horário (day/night). 8 grupos climáticos, cada um com cor de acento própria. Sempre mantém fundo escuro fixo (Terra da órbita) |
| `ui.js` | DOM da home — loading, erro, clima atual, previsão 7 dias, autocomplete |
| `pages/home.js` | Glue code da home — eventos, autocomplete, geolocation, query params, sessionStorage, setFavState (inline attributes para estrela favorita) |
| `pages/details.js` | Carrega dados horários, renderiza tabela e gráfico canvas com duas linhas (temperatura + sensação) |
| `pages/favorites.js` | Lê `store.getFavorites()`, renderiza cards, navegação |

### Bibliotecas externas

| Biblioteca | CDN | Uso |
|------------|-----|-----|
| **Lucide** | `https://unpkg.com/lucide@latest` | Ícones: sun, cloud, cloud-rain, cloud-snow, cloud-lightning, cloud-fog, wind, map-pin, bar-chart-3, star, trash-2 |

## 3. Design System

### Fundo cinematográfico (Terra da órbita)

O fundo é renderizado exclusivamente via CSS com `body::before`:

```css
body::before {
  background:
    radial-gradient(... #3a7abd → transparent),  /* glow atmosférico */
    radial-gradient(... #1a4a7a → transparent),  /* superfície oceânica */
    radial-gradient(... rgba(255,255,255,0.06) → transparent),  /* nuvens */
    radial-gradient(... rgba(255,255,255,0.05) → transparent),
    radial-gradient(... rgba(255,255,255,0.04) → transparent),
    radial-gradient(... rgba(200,230,255,0.03) → transparent),
    linear-gradient(#030612 → #0d2550);  /* espaço profundo */
}
```

- **7 camadas** de gradientes: espaço escuro no topo, glow azul atmosférico, oceano, nuvens sutis
- Fundo **fixo** — não muda com o clima
- Z-index `-1` para não interferir no conteúdo

### Glassmorphism

Todos os cards, inputs e nav utilizam `backdrop-filter`:

| Elemento | `blur` | `saturate` | `border-radius` |
|----------|--------|------------|-----------------|
| Card principal (`#current-weather`) | 30px | 180% | 24px |
| Detalhes (`#detail-card`) | 30px | 180% | 24px |
| Previsão 7 dias (`.forecast-day`) | 16px | 150% | 16px |
| Cards de detalhes (`.detail-item`, `.detail`) | 16px | 150% | 16px |
| Inputs (`#search-input`, `#geo-btn`) | 12px | — | 24px |
| Nav (`.nav-bar`) | 24px | 180% | — |
| Tabela / Gráfico | 20px | 160% | 24px |

### Cores de acento dinâmicas (theme.js)

O `THEME.apply()` define `--accent` e todas as variáveis CSS com base no grupo climático (WMO code). 8 grupos:

| Grupo | WMO | Cor de acento |
|-------|-----|---------------|
| clear | 0-1 | `#7fc8f8` (azul claro) |
| partly-cloudy | 2 | `#8aacca` (azul acinzentado) |
| overcast | 3 | `#8a9aaa` (cinza) |
| drizzle | 51-57 | `#6a8aa0` (azul suave) |
| rain | 61-67, 80-82 | `#5a7a9a` (azul escuro) |
| storm | 95+ | `#7a8aaa` (cinza azulado) |
| snow | 71-77, 85-86 | `#b0c8e0` (gelo) |
| fog | 45-48 | `#a8b6c2` (névoa) |

O texto permanece sempre branco (`#ffffff`) pois o fundo escuro da Terra da órbita é fixo.

### Indicadores de temperatura

A temperatura recebe classe de cor dinâmica:
- `< 10°C` → `.temp-cold` (`#7fc8f8` — azul)
- `10-24°C` → `.temp-mild` (branco)
- `25-34°C` → `.temp-warm` (`#fbbf24` — amarelo)
- `≥ 35°C` → `.temp-hot` (`#f87171` — vermelho)

## 4. Consumo de APIs

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

## 5. Escalabilidade

### Front-end (MPA)
- **CDN**: assets estáticos (HTML, CSS, JS) servidos via CDN (Cloudflare, CloudFront) — cada página é um arquivo HTML independente, cacheável por URL
- **Cache de API**: respostas do Open-Meteo cacheadas no navegador via `Cache-Control` e Service Worker futuramente
- **Lazy loading**: páginas carregam sob demanda (navegação nativa do navegador)

### Se houvesse backend
- Cache Redis para respostas de APIs externas (TTL de 30min)
- Rate limiting por IP
- Backend stateless em containers (ECS/K8s) com auto-scaling

### Dados
- Open-Meteo: gratuito, sem chave, até 10.000 req/dia. Para escala maior: cache próprio ou plano pago
- Nominatim: limite de 1 req/s. Para produção, alternativas: Google Geocoding, Mapbox

## 6. Banco de Dados

### Persistência atual
`localStorage` no navegador via `store.js`:

```
localStorage
├── clima_favoritos: [
│     { id, name, country, latitude, longitude }
│   ]
└── clima_config: {
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

## 7. Segurança

### Front-end (MPA)
- **CSP** (Content-Security-Policy) no `<meta>` ou header HTTP para mitigar XSS
- **Sanitização** de input do usuário antes de enviar para APIs (`encodeURIComponent`)
- **HTTPS** obrigatório (Open-Meteo e Nominatim só aceitam HTTPS)
- Sem chaves/segredos no client-side (nenhuma API requer key)
- **`rel="noopener"`** em links externos

### Detalhes importantes de implementação
- **Ícone de favorito (estrela)**: `lucide.createIcons()` é chamado múltiplas vezes durante o ciclo de vida. Para evitar que a estrela seja re-renderizada e perca o estado favorito, o atributo `data-lucide` é removido do SVG da estrela após a conversão inicial. O `setFavState` usa `setAttribute` inline nos elementos filhos (`polygon`/`path`) para garantir a cor amarela, sem depender de classes CSS que poderiam ser perdidas.

### Se houvesse backend
- Autenticação: JWT com refresh token em httpOnly cookie
- Rate limiting por IP (nginx ou express-rate-limit)
- Helmet.js para headers de segurança
- Validação de input no server (OWASP Top 10)
- Criptografia de senhas com bcrypt (cost 12)
- Prepared statements para queries SQL

## 8. Nuvem (Cloud)

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

## 9. Mobile

CSS responsivo (mobile-first, breakpoint 480px). A barra de pesquisa adapta para layout em linha com botões compactos. Nav, inputs, detalhes e previsão ajustam padding e font-size em telas pequenas. Previsão de 7 dias com `mask-image` para indicar scroll horizontal. Cards de detalhes climáticos mantêm proporção consistente.

Para experiência nativa:
- **PWA**: `manifest.json` + Service Worker permitem instalação no home screen e cache offline
- **React Native / Expo**: reuso da lógica JS (api.js, utils.js, store.js) com componentes nativos
