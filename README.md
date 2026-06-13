# Clima Tempo

Aplicação web responsiva de previsão do tempo que consome as APIs gratuitas do [Open-Meteo](https://open-meteo.com/).

## Funcionalidades

- Busca de clima por nome da cidade com **autocomplete**
- **Geolocalização** automática (botão 📍)
- Exibição do clima atual (temperatura, sensação térmica, umidade, vento)
- Previsão para **7 dias**
- Previsão **horária (24h)** com gráfico canvas e tabela
- **Favoritos** — cidades salvas no navegador
- **Tema escuro** automático ou configurável
- **Multi-página** com navegação entre home, detalhes, favoritos e configurações
- Design responsivo (mobile-first)

## Páginas

| Página | Descrição |
|--------|-----------|
| `index.html` | Home — busca + clima atual + 7 dias |
| `details.html` | Detalhes — previsão horária com gráfico e tabela |
| `favorites.html` | Favoritos — cidades salvas com atalhos |
| `config.html` | Configurações — unidade de temperatura e tema |

## Como usar

Abra o `index.html` no navegador ou sirva com qualquer servidor estático:

```bash
npx serve .
```

Digite o nome de uma cidade e clique em **Buscar**. Use a nav bar para navegar entre as páginas.

## APIs utilizadas

| API | Endpoint | Uso |
|-----|----------|-----|
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search` | Busca de cidades |
| Open-Meteo Weather | `https://api.open-meteo.com/v1/forecast` | Clima atual + 7 dias + horário |
| Nominatim (OSM) | `https://nominatim.openstreetmap.org/reverse` | Reverse geocode para geolocalização |

## Estrutura do projeto

```
├── index.html              # Home
├── details.html            # Detalhes (previsão horária)
├── favorites.html          # Favoritos
├── config.html             # Configurações
├── css/
│   ├── style.css           # Base + nav + variáveis + tema escuro
│   ├── details.css         # Tabela horária, grid, gráfico
│   ├── favorites.css       # Cards de favoritos
│   └── config.css          # Formulário de configuração
├── js/
│   ├── utils.js            # WMO codes, helpers, debounce
│   ├── api.js              # Consumo das APIs
│   ├── store.js            # localStorage (favoritos, config, tema)
│   ├── ui.js               # Renderização DOM da home
│   └── pages/
│       ├── home.js         # Lógica da home
│       ├── details.js      # Lógica dos detalhes
│       ├── favorites.js    # Lógica dos favoritos
│       └── config.js       # Lógica da configuração
└── ARCHITECTURE.md         # Documentação técnica
```

## Arquitetura

Detalhes sobre arquitetura, escalabilidade, banco de dados, segurança e nuvem em [`ARCHITECTURE.md`](ARCHITECTURE.md).
