const API = {
  GEOCODING_BASE: 'https://geocoding-api.open-meteo.com/v1',
  WEATHER_BASE: 'https://api.open-meteo.com/v1',

  async searchCities(query) {
    const url = `${this.GEOCODING_BASE}/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar cidade');
    const data = await res.json();
    return data.results || [];
  },

  async searchCity(query) {
    const results = await this.searchCities(query);
    if (results.length === 0) throw new Error('Cidade não encontrada');
    return results[0];
  },

  async getWeather(lat, lon) {
    const url = `${this.WEATHER_BASE}/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum` +
      `&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar clima');
    return res.json();
  },
};
