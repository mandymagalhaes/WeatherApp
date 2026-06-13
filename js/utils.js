const WMO_CODES = {
  0: { desc: 'Céu limpo', icon: '☀️' },
  1: { desc: 'Predominantemente limpo', icon: '🌤️' },
  2: { desc: 'Parcialmente nublado', icon: '⛅' },
  3: { desc: 'Encoberto', icon: '☁️' },
  45: { desc: 'Nevoeiro', icon: '🌫️' },
  48: { desc: 'Nevoeiro com geada', icon: '🌫️' },
  51: { desc: 'Garoa leve', icon: '🌦️' },
  53: { desc: 'Garoa moderada', icon: '🌦️' },
  55: { desc: 'Garoa intensa', icon: '🌧️' },
  56: { desc: 'Garoa congelante leve', icon: '🌧️' },
  57: { desc: 'Garoa congelante intensa', icon: '🌧️' },
  61: { desc: 'Chuva leve', icon: '🌦️' },
  63: { desc: 'Chuva moderada', icon: '🌧️' },
  65: { desc: 'Chuva intensa', icon: '🌧️' },
  66: { desc: 'Chuva congelante leve', icon: '🌧️' },
  67: { desc: 'Chuva congelante intensa', icon: '🌧️' },
  71: { desc: 'Neve leve', icon: '🌨️' },
  73: { desc: 'Neve moderada', icon: '🌨️' },
  75: { desc: 'Neve intensa', icon: '❄️' },
  77: { desc: 'Grãos de neve', icon: '❄️' },
  80: { desc: 'Pancadas de chuva leve', icon: '🌦️' },
  81: { desc: 'Pancadas de chuva moderada', icon: '🌧️' },
  82: { desc: 'Pancadas de chuva intensa', icon: '🌧️' },
  85: { desc: 'Pancadas de neve leve', icon: '🌨️' },
  86: { desc: 'Pancadas de neve intensa', icon: '❄️' },
  95: { desc: 'Tempestade', icon: '⛈️' },
  96: { desc: 'Tempestade com granizo leve', icon: '⛈️' },
  99: { desc: 'Tempestade com granizo intenso', icon: '⛈️' },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: 'Desconhecido', icon: '❓' };
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
  return dias[date.getDay()];
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
