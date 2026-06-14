const THEME = {
  _group(code) {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2) return 'partly-cloudy';
    if (code === 3) return 'overcast';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code >= 61 && code <= 67 || code >= 80 && code <= 82) return 'rain';
    if (code >= 71 && code <= 77 || code >= 85 && code <= 86) return 'snow';
    if (code >= 95) return 'storm';
    return 'clear';
  },

  _accents: {
    'clear': '#7fc8f8',
    'partly-cloudy': '#8aacca',
    'overcast': '#8a9aaa',
    'drizzle': '#6a8aa0',
    'rain': '#5a7a9a',
    'storm': '#7a8aaa',
    'snow': '#b0c8e0',
    'fog': '#a8b6c2',
  },

  apply(code) {
    const group = this._group(code);
    const accent = this._accents[group] || this._accents['clear'];

    const body = document.body;
    body.style.setProperty('--accent', accent);
    body.style.setProperty('--text', '#ffffff');
    body.style.setProperty('--text-muted', 'rgba(255,255,255,0.6)');
    body.style.setProperty('--card-bg', 'rgba(255,255,255,0.06)');
    body.style.setProperty('--card-border', 'rgba(255,255,255,0.1)');
    body.style.setProperty('--input-bg', 'rgba(255,255,255,0.08)');
    body.style.setProperty('--nav-bg', 'rgba(0,0,0,0.15)');
    body.style.setProperty('--nav-border', 'rgba(255,255,255,0.06)');
    body.style.setProperty('--btn-bg', 'rgba(255,255,255,0.1)');
    body.style.setProperty('--btn-secondary-bg', 'rgba(255,255,255,0.05)');
    body.style.setProperty('--btn-secondary-text', 'rgba(255,255,255,0.8)');
    body.style.setProperty('--autocomplete-bg', 'rgba(10,15,30,0.92)');
    body.style.setProperty('--autocomplete-text', '#ffffff');
    body.style.setProperty('--autocomplete-hover', 'rgba(255,255,255,0.08)');
    body.style.setProperty('--autocomplete-border', 'rgba(255,255,255,0.08)');
    body.style.setProperty('--autocomplete-region', 'rgba(255,255,255,0.45)');
    body.style.setProperty('--error-bg', 'rgba(200,60,60,0.15)');
    body.style.setProperty('--error-text', '#f0a0a0');
    body.style.setProperty('--scrollbar-thumb', 'rgba(255,255,255,0.15)');
    body.style.setProperty('--skeleton-base', 'rgba(255,255,255,0.04)');
    body.style.setProperty('--skeleton-shine', 'rgba(255,255,255,0.1)');
    body.style.setProperty('--now-bg', 'rgba(255,255,255,0.06)');
    document.documentElement.classList.remove('light-bg');
  },

  init() {
    const saved = sessionStorage.getItem('lastCity');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.weatherCode != null) { this.apply(p.weatherCode); return; }
      } catch {}
    }
  },

  reset() {
    const body = document.body;
    ['--accent','--text','--text-muted','--card-bg','--card-border','--input-bg','--nav-bg','--nav-border','--btn-bg','--btn-secondary-bg','--btn-secondary-text','--autocomplete-bg','--autocomplete-text','--autocomplete-hover','--autocomplete-border','--autocomplete-region','--error-bg','--error-text','--scrollbar-thumb','--skeleton-base','--skeleton-shine','--now-bg'].forEach(k => body.style.removeProperty(k));
    document.documentElement.classList.remove('light-bg');
  },
};
