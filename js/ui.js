const UI = {
  elements: {},

  init() {
    this.elements = {
      searchForm: document.getElementById('search-form'),
      searchInput: document.getElementById('search-input'),
      autocompleteList: document.getElementById('autocomplete-list'),
      loading: document.getElementById('loading'),
      error: document.getElementById('error'),
      currentWeather: document.getElementById('current-weather'),
      forecast: document.getElementById('forecast'),
      cityName: document.getElementById('city-name'),
      country: document.getElementById('country'),
      weatherIcon: document.getElementById('weather-icon'),
      temperature: document.getElementById('temperature'),
      weatherDescription: document.getElementById('weather-description'),
      feelsLike: document.getElementById('feels-like'),
      humidity: document.getElementById('humidity'),
      wind: document.getElementById('wind'),
      forecastList: document.getElementById('forecast-list'),
    };
  },

  showLoading() {
    this.elements.loading.classList.remove('hidden');
    this.elements.error.classList.add('hidden');
    this.elements.currentWeather.classList.add('hidden');
    this.elements.forecast.classList.add('hidden');
  },

  hideLoading() {
    this.elements.loading.classList.add('hidden');
  },

  showError(msg) {
    this.hideLoading();
    this.elements.error.textContent = msg;
    this.elements.error.classList.remove('hidden');
    this.elements.currentWeather.classList.add('hidden');
    this.elements.forecast.classList.add('hidden');
  },

  renderCurrentWeather(data, city, country) {
    const current = data.current;
    const info = getWeatherInfo(current.weather_code);

    this.elements.cityName.textContent = city;
    this.elements.country.textContent = country;
    this.elements.weatherIcon.textContent = info.icon;
    this.elements.temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
    this.elements.weatherDescription.textContent = info.desc;
    this.elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    this.elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    this.elements.wind.textContent = `${current.wind_speed_10m} km/h`;

    this.elements.currentWeather.classList.remove('hidden');
  },

  renderForecast(data) {
    const daily = data.daily;
    this.elements.forecastList.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++) {
      const info = getWeatherInfo(daily.weather_code[i]);
      const day = document.createElement('div');
      day.className = 'forecast-day';
      day.innerHTML = `
        <div class="day-name">${formatDate(daily.time[i])}</div>
        <div class="day-icon">${info.icon}</div>
        <div class="day-temps">
          <span class="high">${Math.round(daily.temperature_2m_max[i])}°</span>
          <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span>
        </div>
        <div class="day-precip">${daily.precipitation_sum[i]} mm</div>
      `;
      this.elements.forecastList.appendChild(day);
    }

    this.elements.forecast.classList.remove('hidden');
  },

  renderSuggestions(results) {
    const list = this.elements.autocompleteList;
    list.innerHTML = '';

    results.forEach((r) => {
      const li = document.createElement('li');
      li.dataset.lat = r.latitude;
      li.dataset.lon = r.longitude;
      li.dataset.name = r.name;
      li.dataset.country = r.country || '';
      li.innerHTML = `
        <span class="suggestion-name">${r.name}</span>
        <span class="suggestion-region">${r.admin1 || ''}${r.admin1 && r.country ? ', ' : ''}${r.country || ''}</span>
      `;
      list.appendChild(li);
    });

    this.elements.autocompleteList.classList.remove('hidden');
  },

  hideSuggestions() {
    this.elements.autocompleteList.classList.add('hidden');
  },

  clear() {
    this.elements.currentWeather.classList.add('hidden');
    this.elements.forecast.classList.add('hidden');
    this.elements.error.classList.add('hidden');
  },
};
