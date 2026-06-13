(function () {
  document.addEventListener('DOMContentLoaded', () => {
    UI.init();

    const input = UI.elements.searchInput;
    const list = UI.elements.autocompleteList;
    let selectedIndex = -1;

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
    } catch (err) {
      UI.showError(err.message);
    }
  }
})();
