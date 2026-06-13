# Clima Tempo

Aplicação web responsiva de previsão do tempo que consome as APIs gratuitas do [Open-Meteo](https://open-meteo.com/).

## Funcionalidades

- Busca de clima por nome da cidade
- Exibição do clima atual (temperatura, sensação térmica, umidade, vento)
- Previsão para 7 dias
- Design responsivo (mobile-first)
- Ícones e descrições em português

## Como usar

Abra o `index.html` no navegador ou sirva com qualquer servidor estático:

```bash
npx serve .
```

Digite o nome de uma cidade e clique em **Buscar**.

## APIs utilizadas

| API | Endpoint |
|-----|----------|
| Geocoding | `https://geocoding-api.open-meteo.com/v1/search` |
| Weather | `https://api.open-meteo.com/v1/forecast` |

## Estrutura do projeto

```
├── index.html         # Página principal
├── css/style.css      # Estilos responsivos
├── js/
│   ├── app.js         # Orquestrador principal
│   ├── api.js         # Consumo das APIs
│   ├── ui.js          # Renderização DOM
│   └── utils.js       # Helpers e constantes
└── ARCHITECTURE.md    # Documentação técnica
```

## Arquitetura

Detalhes sobre arquitetura, escalabilidade, banco de dados, segurança e nuvem em [`ARCHITECTURE.md`](ARCHITECTURE.md).
