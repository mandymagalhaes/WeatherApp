const WMO_CODES = {
  0: { desc: 'Céu limpo', emoji: '☀️', lucide: 'sun' },
  1: { desc: 'Predominantemente limpo', emoji: '🌤️', lucide: 'sun' },
  2: { desc: 'Parcialmente nublado', emoji: '⛅', lucide: 'cloud-sun' },
  3: { desc: 'Encoberto', emoji: '☁️', lucide: 'cloud' },
  45: { desc: 'Nevoeiro', emoji: '🌫️', lucide: 'cloud-fog' },
  48: { desc: 'Nevoeiro com geada', emoji: '🌫️', lucide: 'cloud-fog' },
  51: { desc: 'Garoa leve', emoji: '🌦️', lucide: 'cloud-drizzle' },
  53: { desc: 'Garoa moderada', emoji: '🌦️', lucide: 'cloud-drizzle' },
  55: { desc: 'Garoa intensa', emoji: '🌧️', lucide: 'cloud-drizzle' },
  56: { desc: 'Garoa congelante leve', emoji: '🌧️', lucide: 'cloud-drizzle' },
  57: { desc: 'Garoa congelante intensa', emoji: '🌧️', lucide: 'cloud-drizzle' },
  61: { desc: 'Chuva leve', emoji: '🌦️', lucide: 'cloud-rain' },
  63: { desc: 'Chuva moderada', emoji: '🌧️', lucide: 'cloud-rain' },
  65: { desc: 'Chuva intensa', emoji: '🌧️', lucide: 'cloud-rain' },
  66: { desc: 'Chuva congelante leve', emoji: '🌧️', lucide: 'cloud-rain' },
  67: { desc: 'Chuva congelante intensa', emoji: '🌧️', lucide: 'cloud-rain' },
  71: { desc: 'Neve leve', emoji: '🌨️', lucide: 'cloud-snow' },
  73: { desc: 'Neve moderada', emoji: '🌨️', lucide: 'cloud-snow' },
  75: { desc: 'Neve intensa', emoji: '❄️', lucide: 'cloud-snow' },
  77: { desc: 'Grãos de neve', emoji: '❄️', lucide: 'cloud-snow' },
  80: { desc: 'Pancadas de chuva leve', emoji: '🌦️', lucide: 'cloud-rain' },
  81: { desc: 'Pancadas de chuva moderada', emoji: '🌧️', lucide: 'cloud-rain' },
  82: { desc: 'Pancadas de chuva intensa', emoji: '🌧️', lucide: 'cloud-rain' },
  85: { desc: 'Pancadas de neve leve', emoji: '🌨️', lucide: 'cloud-snow' },
  86: { desc: 'Pancadas de neve intensa', emoji: '❄️', lucide: 'cloud-snow' },
  95: { desc: 'Tempestade', emoji: '⛈️', lucide: 'cloud-lightning' },
  96: { desc: 'Tempestade com granizo leve', emoji: '⛈️', lucide: 'cloud-lightning' },
  99: { desc: 'Tempestade com granizo intenso', emoji: '⛈️', lucide: 'cloud-lightning' },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: 'Desconhecido', emoji: '❓', lucide: 'cloud-off' };
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
