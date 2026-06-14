# WeatherApp

Aplicação web responsiva de previsão do tempo com design cinematográfico (Terra vista da órbita) e glassmorphism. Consome as APIs gratuitas do [Open-Meteo](https://open-meteo.com/).

## Funcionalidades

- Busca de clima por nome da cidade com **autocomplete**
- **Geolocalização** automática via botão
- Clima atual (temperatura, sensação térmica, umidade, vento)
- Previsão para **7 dias** com scroll horizontal
- Previsão **horária (24h)** com gráfico canvas e tabela
- **Favoritos** — cidades salvas no navegador
- **Multi-página** com navegação entre home, detalhes e favoritos
- Design cinematográfico: fundo Terra da órbita com CSS gradients + glassmorphism
- Cores de acento dinâmicas conforme o clima (THEME engine)
- Temperatura numerada com cor gradual (frio → azul, quente → laranja)

## Páginas

| Página | Descrição |
|--------|-----------|
| `index.html` | Home — busca + clima atual + 7 dias |
| `details.html` | Detalhes — previsão horária com gráfico e tabela |
| `favorites.html` | Favoritos — cidades salvas com atalhos |

## Como usar

```bash
npx serve .
```

Abra o navegador, digite uma cidade e clique em **Buscar**. Navegue entre as páginas pela nav bar.

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
├── css/
│   ├── style.css           # Base: nav, variáveis, Terra da órbita, glassmorphism
│   ├── details.css         # Tabela horária, grid, gráfico
│   └── favorites.css       # Cards de favoritos
├── js/
│   ├── utils.js            # WMO codes, getWeatherInfo, formatDate, debounce
│   ├── api.js              # Chamadas HTTP: Geocoding, Weather, Nominatim
│   ├── store.js            # localStorage (favoritos, tema)
│   ├── theme.js            # Cores de acento dinâmicas por clima
│   ├── ui.js               # Renderização DOM da home
│   └── pages/
│       ├── home.js         # Lógica da home
│       ├── details.js      # Lógica dos detalhes (tabela, gráfico canvas)
│       └── favorites.js    # Lógica dos favoritos
└── ARCHITECTURE.md
```

## Arquitetura

Detalhes sobre arquitetura, escalabilidade, banco de dados, segurança e nuvem em [`ARCHITECTURE.md`](ARCHITECTURE.md).
