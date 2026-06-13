const API = {
  GEOCODING_BASE: 'https://geocoding-api.open-meteo.com/v1',
  WEATHER_BASE: 'https://api.open-meteo.com/v1',
  NOMINATIM_BASE: 'https://nominatim.openstreetmap.org',

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

  async getHourly(lat, lon) {
    const url = `${this.WEATHER_BASE}/forecast?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation_probability` +
      `&timezone=auto&forecast_hours=24`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar previsão horária');
    return res.json();
  },

  async reverseGeocode(lat, lon) {
    const url = `${this.NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao obter localização');
    const data = await res.json();
    return {
      name: data.address?.city || data.address?.town || data.address?.village || data.name || 'Sua localização',
      country: data.address?.country || '',
      latitude: lat,
      longitude: lon,
    };
  },
};
