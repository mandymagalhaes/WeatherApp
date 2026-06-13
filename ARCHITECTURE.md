# Arquitetura — Clima Tempo

## 1. Visão Geral

Aplicação web responsiva de previsão do tempo. O front-end consome duas APIs públicas do Open-Meteo (Geocoding + Weather) e renderiza os dados sem necessidade de backend próprio.

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐
│  Browser │ ──▶ │ Open-Meteo   │ ◀── │ Geocoding API    │
│  (SPA)   │     │ API Gateway  │     │ /v1/search       │
└──────────┘     └──────┬───────┘     └──────────────────┘
                        │
                  ┌─────▼──────┐
                  │ Weather    │
                  │ API        │
                  │ /v1/forecast│
                  └────────────┘
```

## 2. Organização do Código

```
WeatherApp/
├── index.html          # Entry point, estrutura semântica
├── css/
│   └── style.css       # Mobile-first, design system
├── js/
│   ├── app.js          # Orquestrador, eventos, ciclo de vida
│   ├── api.js          # Camada de consumo das APIs
│   ├── ui.js           # Manipulação do DOM
│   └── utils.js        # Helpers: WMO codes, datas, debounce
└── ARCHITECTURE.md
```

Cada módulo tem responsabilidade única:
- **api.js** — isola chamadas HTTP, parsing, tratamento de erros de rede. Trocar de API significa mexer só aqui.
- **ui.js** — renderiza dados no DOM, gerencia estados (loading, erro, vazio). Desacoplado da lógica de negócio.
- **utils.js** — funções puras e configurações (mapeamento WMO).
- **app.js** — glue code: conecta eventos do usuário → API → UI.

## 3. Consumo de APIs

| API | Endpoint | Uso |
|-----|----------|-----|
| Geocoding | `GET /v1/search?name={cidade}` | Converte nome de cidade em lat/lon |
| Weather | `GET /v1/forecast?latitude={lat}&longitude={lon}` | Retorna clima atual + 7 dias |

Tratamento de erros:
- Timeout e rede: `fetch` com `AbortController`
- HTTP não-2xx: mensagem amigável ao usuário
- Cidade não encontrada: validação no JSON de resposta

## 4. Escalabilidade

### Horizontal (front-end)
- **CDN**: assets estáticos (HTML, CSS, JS) servidos via CDN (Cloudflare, AWS CloudFront) reduz latência global.
- **Cache de API**: respostas do Open-Meteo são cacheadas no navegador (Cache API / Service Worker) — previsão do tempo muda a cada hora, pode usar estratégia `stale-while-revalidate`.
- **Lazy loading**: se adicionar gráficos ou mapas, carregar sob demanda.

### Se houvesse backend
- Cache Redis para respostas de APIs externas (TTL de 30min).
- Rate limiting por IP.
- Backend stateless em containers (ECS/K8s) com auto-scaling baseado em CPU/requisições.

### Dados
- Open-Meteo é gratuito e sem chave de API para até 10.000 req/dia. Para escala maior, usar cache próprio ou plano pago.

## 5. Banco de Dados

### Sem backend → sem banco
Nesta arquitetura 100% client-side, **não há banco de dados**. Os dados são voláteis (estado da UI).

### Se houvesse necessidade de persistência (favoritos, histórico):
```
┌────────────────────────────────────────────────┐
│ PostgreSQL (relacional)                        │
│                                                 │
│ usuários: id, email, senha_hash, created_at    │
│ favoritos: id, user_id, cidade, lat, lon       │
│ historico: id, user_id, cidade, dados_json, ts │
└────────────────────────────────────────────────┘
```
- **PostgreSQL** escolhido por: maturidade, JSONB para dados semi-estruturados, índices GIN para busca textual de cidades.
- Alternativa: **SQLite** (embarcado) se o app fosse nativo mobile com dados locais.

## 6. Segurança

### Front-end
- **CSP** (Content-Security-Policy) no header HTML para evitar XSS.
- **Sanitização** de input do usuário antes de buscar cidade.
- **HTTPS** obrigatório (Open-Meteo só aceita HTTPS).
- Sem chaves/segredos no client-side (Open-Meteo não requer API key).

### Se houvesse backend
- Autenticação: JWT com refresh token (httpOnly cookie).
- Rate limiting por IP (nginx/express-rate-limit).
- Helmet.js para headers de segurança.
- Validação de input no server (OWASP Top 10).
- Criptografia de senhas com bcrypt (cost 12).
- Prepared statements para queries SQL.

## 7. Nuvem (Cloud)

### Arquitetura proposta para produção com backend

```
Cloudflare DNS
    │
    ▼
CloudFront / CDN ──▶ S3 (static assets)
    │
    ▼
ALB ──▶ ECS Fargate (containers Node.js)
           │
           ├── Redis ElastiCache (cache)
           └── RDS PostgreSQL
```

| Serviço | Função | Justificativa |
|---------|--------|---------------|
| **CloudFront** | CDN | Distribuição global, baixa latência, SSL automático |
| **S3** | Static hosting | Barato, versionamento de assets |
| **ECS Fargate** | Backend API | Serverless containers, sem gerenciar servidor |
| **ElastiCache Redis** | Cache | Respostas de API externa em memória, sub-ms |
| **RDS PostgreSQL** | Dados persistentes | Multi-AZ, backup automático, escalável até 16TB |
| **Route53** | DNS | Health checks, failover |

### Escalabilidade na nuvem
- **Auto-scaling**: ECS Service Auto Scaling baseado em CPU ou RequestCount.
- **Multi-AZ**: RDS e ECS distribuídos em 3 availability zones.
- **Read replicas**: RDS read replicas para queries de histórico.
- **Caching em 3 níveis**: CDN (edge) → Redis (app) → Browser Cache API (client).

## 8. Mobile

CSS responsivo (mobile-first) torna o app utilizável em qualquer dispositivo. Para experiência nativa:
- **PWA**: manifest.json + Service Worker permitem instalação no home screen e funcionamento offline parcial.
- **React Native / Expo**: reuso da lógica JS, componentes nativos.
