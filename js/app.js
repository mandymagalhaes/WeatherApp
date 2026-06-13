(function () {
  document.addEventListener('DOMContentLoaded', () => {
    UI.init();

    UI.elements.searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = UI.elements.searchInput.value.trim();
      if (!query) return;

      await searchAndRender(query);
    });
  });

  async function searchAndRender(query) {
    UI.showLoading();

    try {
      const geo = await API.searchCity(query);
      const weather = await API.getWeather(geo.latitude, geo.longitude);

      UI.hideLoading();
      UI.renderCurrentWeather(weather, geo.name, geo.country || '');
      UI.renderForecast(weather);
      UI.elements.searchInput.value = '';
    } catch (err) {
      UI.showError(err.message);
    }
  }
})();
