(function () {
  let currentLat = null;
  let currentLon = null;
  let currentName = '';
  let currentCountry = '';

  document.addEventListener('DOMContentLoaded', () => {
    STORE.initTheme();
    UI.init();
    if (window.THEME) THEME.init();

    const input = UI.elements.searchInput;
    const list = UI.elements.autocompleteList;
    const actions = document.getElementById('weather-actions');
    const detailsLink = document.getElementById('details-link');
    const favBtn = document.getElementById('fav-btn');

    if (window.lucide) lucide.createIcons();

    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-bar')) navLinks.classList.remove('open');
      });
    }

    const favIcon = document.getElementById('fav-icon');
    if (favIcon) favIcon.removeAttribute('data-lucide');
    let selectedIndex = -1;

    const params = new URLSearchParams(window.location.search);
    let paramLat = parseFloat(params.get('lat'));
    let paramLon = parseFloat(params.get('lon'));
    let paramName = params.get('name');
    let paramCountry = params.get('country') || '';

    if (isNaN(paramLat) || isNaN(paramLon) || !paramName) {
      const last = sessionStorage.getItem('lastCity');
      if (last) {
        const parsed = JSON.parse(last);
        paramLat = parsed.lat;
        paramLon = parsed.lon;
        paramName = parsed.name || '';
        paramCountry = parsed.country || '';
      }
    }

    if (!isNaN(paramLat) && !isNaN(paramLon) && paramName) {
      fetchWeather(paramLat, paramLon, paramName, paramCountry);
      input.value = paramName;
    }

    UI.elements.searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      UI.hideSuggestions();
      await searchAndRender(query);
    });

    const onInput = debounce(async () => {
      const query = input.value.trim();
      if (query.length < 2) {
        UI.hideSuggestions();
        return;
      }
      try {
        const results = await API.searchCities(query);
        if (results.length > 0) {
          UI.renderSuggestions(results);
          selectedIndex = -1;
        } else {
          UI.hideSuggestions();
        }
      } catch {
        UI.hideSuggestions();
      }
    }, 300);

    input.addEventListener('input', onInput);

    list.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      selectSuggestion(li);
    });

    input.addEventListener('keydown', (e) => {
      const items = list.querySelectorAll('li');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateActive(items, selectedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateActive(items, selectedIndex);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(items[selectedIndex]);
      } else if (e.key === 'Escape') {
        UI.hideSuggestions();
        input.blur();
        selectedIndex = -1;
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => UI.hideSuggestions(), 200);
    });

    input.addEventListener('focus', () => {
      if (list.children.length > 0 && !list.classList.contains('hidden')) {
        list.classList.remove('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        UI.hideSuggestions();
      }
    });

    UI.elements.geoBtn.addEventListener('click', getGeolocation);

    detailsLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentLat === null) return;
      const params = new URLSearchParams({
        lat: currentLat,
        lon: currentLon,
        name: currentName,
        country: currentCountry,
      });
      window.location.href = `details.html?${params}`;
    });

    favBtn.addEventListener('click', () => {
      if (currentLat === null) return;
      if (STORE.isFavorite(currentLat, currentLon)) {
        STORE.removeFavorite(currentLat, currentLon);
        setFavState(favIcon, false);
      } else {
        STORE.addFavorite({
          name: currentName,
          country: currentCountry,
          latitude: currentLat,
          longitude: currentLon,
        });
        setFavState(favIcon, true);
      }
    });
  });

  function updateActive(items, index) {
    items.forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    if (index >= 0) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  function selectSuggestion(li) {
    UI.elements.searchInput.value = li.dataset.name;
    UI.hideSuggestions();
    fetchWeather(
      parseFloat(li.dataset.lat),
      parseFloat(li.dataset.lon),
      li.dataset.name,
      li.dataset.country
    );
  }

  async function searchAndRender(query) {
    UI.showLoading();
    try {
      const geo = await API.searchCity(query);
      await fetchWeather(geo.latitude, geo.longitude, geo.name, geo.country || '');
    } catch (err) {
      UI.showError(err.message);
    }
  }

  async function fetchWeather(lat, lon, cityName, country) {
    UI.showLoading();
    try {
      const weather = await API.getWeather(lat, lon);
      UI.hideLoading();
      UI.renderCurrentWeather(weather, cityName, country);
      UI.renderForecast(weather);

      currentLat = lat;
      currentLon = lon;
      currentName = cityName;
      currentCountry = country;
      sessionStorage.setItem('lastCity', JSON.stringify({ lat, lon, name: cityName, country: country || '', weatherCode: weather.current.weather_code }));

      const actions = document.getElementById('weather-actions');
      const detailsLink = document.getElementById('details-link');
      const favIcon = document.getElementById('fav-icon');
      const params = new URLSearchParams({ lat, lon, name: cityName, country: country || '' });
      detailsLink.href = `details.html?${params}`;
      setFavState(favIcon, STORE.isFavorite(lat, lon));
      actions.classList.remove('hidden');
    } catch (err) {
      UI.showError(err.message);
    }
  }

  function setFavState(el, filled) {
    if (!el) return;
    if (filled) {
      el.querySelectorAll('polygon, path').forEach(child => {
        child.setAttribute('fill', '#fbbf24');
        child.setAttribute('stroke', '#fbbf24');
      });
      el.setAttribute('fill', '#fbbf24');
    } else {
      el.querySelectorAll('polygon, path').forEach(child => {
        child.setAttribute('fill', 'none');
        child.removeAttribute('stroke');
      });
      el.setAttribute('fill', 'none');
    }
  }

  async function getGeolocation() {
    if (!navigator.geolocation) {
      UI.showError('Geolocalização não suportada neste navegador');
      return;
    }
    UI.showLoading();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await API.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          await fetchWeather(geo.latitude, geo.longitude, geo.name, geo.country);
        } catch (err) {
          UI.showError(err.message);
        }
      },
      (err) => {
        let msg = 'Erro ao obter localização';
        if (err.code === 1) msg = 'Permissão de localização negada';
        else if (err.code === 2) msg = 'Localização indisponível';
        else if (err.code === 3) msg = 'Tempo de localização esgotado';
        UI.showError(msg);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }
})();
