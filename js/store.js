const STORE = {
  FAVORITES_KEY: 'clima_favoritos',
  CONFIG_KEY: 'clima_config',

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this.FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  },

  setFavorites(list) {
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(list));
  },

  addFavorite(city) {
    const list = this.getFavorites();
    const exists = list.some(
      (f) => f.latitude === city.latitude && f.longitude === city.longitude
    );
    if (exists) return;
    list.push({
      id: `${city.latitude}_${city.longitude}`,
      name: city.name,
      country: city.country || '',
      latitude: city.latitude,
      longitude: city.longitude,
    });
    this.setFavorites(list);
  },

  removeFavorite(lat, lon) {
    const list = this.getFavorites().filter(
      (f) => f.latitude !== lat || f.longitude !== lon
    );
    this.setFavorites(list);
  },

  isFavorite(lat, lon) {
    return this.getFavorites().some(
      (f) => f.latitude === lat && f.longitude === lon
    );
  },

  getConfig() {
    const defaults = { unit: 'celsius', theme: 'auto' };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(this.CONFIG_KEY)) };
    } catch {
      return defaults;
    }
  },

  setConfig(config) {
    const current = this.getConfig();
    const merged = { ...current, ...config };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(merged));
    this.applyTheme(merged.theme);
  },

  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else if (theme === 'light') {
      document.body.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark', prefersDark);
    }
  },

  initTheme() {
    const config = this.getConfig();
    this.applyTheme(config.theme);
  },
};
