(function () {
  document.addEventListener('DOMContentLoaded', () => {
    STORE.initTheme();

    const config = STORE.getConfig();
    document.getElementById('unit-select').value = config.unit;
    document.getElementById('theme-select').value = config.theme;

    document.getElementById('config-form').addEventListener('submit', (e) => {
      e.preventDefault();
      STORE.setConfig({
        unit: document.getElementById('unit-select').value,
        theme: document.getElementById('theme-select').value,
      });
      alert('Configurações salvas!');
    });
  });
})();
