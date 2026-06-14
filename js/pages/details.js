(function () {
  let currentLat = null;
  let currentLon = null;
  let currentName = '';
  let currentCountry = '';

  document.addEventListener('DOMContentLoaded', () => {
    STORE.initTheme();
    if (window.THEME) THEME.init();

    const params = new URLSearchParams(window.location.search);
    let lat = parseFloat(params.get('lat'));
    let lon = parseFloat(params.get('lon'));
    let name = params.get('name') || '';
    let country = params.get('country') || '';

    if (isNaN(lat) || isNaN(lon)) {
      const last = sessionStorage.getItem('lastCity');
      if (last) {
        const parsed = JSON.parse(last);
        lat = parsed.lat;
        lon = parsed.lon;
        name = parsed.name || '';
        country = parsed.country || '';
      }
    }

    if (!isNaN(lat) && !isNaN(lon)) {
      currentLat = lat;
      currentLon = lon;
      currentName = name;
      currentCountry = country;
      loadDetails(lat, lon, name, country);
    } else {
      document.getElementById('error').textContent = 'Nenhuma cidade selecionada. Busque uma cidade na página inicial.';
      document.getElementById('error').classList.remove('hidden');
    }

    const favBtn = document.getElementById('detail-fav-btn');

    if (window.lucide) lucide.createIcons();

    const favIcon = document.getElementById('detail-fav-icon');
    if (favIcon) favIcon.removeAttribute('data-lucide');

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

  async function loadDetails(lat, lon, name, country) {
    showLoading();

    try {
      const data = await API.getWeather(lat, lon);
      const hourly = await API.getHourly(lat, lon);

      hideLoading();
      renderHeader(name, country, lat, lon);
      renderCurrent(data);
      renderHourly(hourly);
    } catch (err) {
      showError(err.message);
    }
  }

  function renderHeader(name, country, lat, lon) {
    document.getElementById('detail-city-name').textContent = name;
    document.getElementById('detail-country').textContent = country;
    document.getElementById('detail-header').classList.remove('hidden');

    const favIcon = document.getElementById('detail-fav-icon');
    setFavState(favIcon, STORE.isFavorite(lat, lon));
  }

  function renderCurrent(data) {
    const current = data.current;
    const info = getWeatherInfo(current.weather_code);

    document.getElementById('detail-icon').innerHTML = `<i data-lucide="${info.lucide}"></i>`;
    const tempVal = Math.round(current.temperature_2m);
    const tempEl = document.getElementById('detail-temp');
    tempEl.textContent = `${tempVal}°C`;
    tempEl.className = '';
    if (tempVal < 10) tempEl.classList.add('temp-cold');
    else if (tempVal < 25) tempEl.classList.add('temp-mild');
    else if (tempVal < 35) tempEl.classList.add('temp-warm');
    else tempEl.classList.add('temp-hot');
    document.getElementById('detail-desc').textContent = info.desc;
    document.getElementById('detail-feels').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('detail-humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('detail-wind').textContent = `${current.wind_speed_10m} km/h`;

    document.getElementById('detail-current').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    if (window.THEME) THEME.apply(current.weather_code);
  }

  function renderHourly(data) {
    const hourly = data.hourly;
    const table = document.getElementById('hourly-table');
    table.innerHTML = '';

    const rows = ['hora', 'clima', 'temp', 'sensação', 'vento', 'umidade', 'precip.'];
    const header = document.createElement('div');
    header.className = 'hourly-row hourly-header';
    rows.forEach((r) => {
      const cell = document.createElement('span');
      cell.className = 'hourly-cell';
      cell.textContent = r;
      header.appendChild(cell);
    });
    table.appendChild(header);

    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 0; i < hourly.time.length; i++) {
      const time = new Date(hourly.time[i] + 'Z');
      const hour = time.getHours();
      const info = getWeatherInfo(hourly.weather_code[i]);

      const row = document.createElement('div');
      row.className = 'hourly-row';
      if (hour === currentHour) row.classList.add('now');

      const cells = [
        `${hour}h`,
        `<i data-lucide="${info.lucide}"></i>`,
        `${Math.round(hourly.temperature_2m[i])}°`,
        `${Math.round(hourly.apparent_temperature[i])}°`,
        `${hourly.wind_speed_10m[i]} km/h`,
        `${hourly.relative_humidity_2m[i]}%`,
        `${hourly.precipitation_probability[i] ?? 0}%`,
      ];

      cells.forEach((c) => {
        const cell = document.createElement('span');
        cell.className = 'hourly-cell';
        cell.innerHTML = c;
        row.appendChild(cell);
      });

      table.appendChild(row);
    }

    document.getElementById('detail-hourly').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    drawChart(hourly);
  }

  function drawChart(hourly) {
    const canvas = document.getElementById('hourly-chart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains('light-bg') === false;

    const colors = {
      grid: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      label: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(28,44,60,0.4)',
      temp: isDark ? '#A0C8E8' : '#5A8AAA',
      feels: isDark ? '#f0b8a0' : '#c89080',
      legendBg: isDark ? 'rgba(20,25,35,0.8)' : 'rgba(255,255,255,0.8)',
      legendBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      legendText: isDark ? '#ffffff' : '#1c2c3c',
    };

    const temps = hourly.temperature_2m;
    const feels = hourly.apparent_temperature;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allTemps = [...temps, ...feels];
    const minTemp = Math.min(...allTemps) - 2;
    const maxTemp = Math.max(...allTemps) + 2;
    const range = maxTemp - minTemp || 1;

    const getX = (i) => padding.left + (i / (temps.length - 1)) * chartW;
    const getY = (v) => padding.top + chartH - ((v - minTemp) / range) * chartH;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let t = Math.ceil(minTemp); t <= Math.floor(maxTemp); t += 5) {
      const y = getY(t);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = colors.label;
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${t}°`, padding.left - 6, y + 4);
    }

    function drawLine(data, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      data.forEach((t, i) => {
        const x = getX(i);
        const y = getY(t);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      data.forEach((t, i) => {
        const x = getX(i);
        const y = getY(t);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    drawLine(temps, colors.temp);
    drawLine(feels, colors.feels);

    ctx.fillStyle = colors.label;
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    temps.forEach((_, i) => {
      if (i % 3 === 0 || i === temps.length - 1) {
        const hour = new Date(hourly.time[i] + 'Z').getHours();
        ctx.fillText(`${hour}h`, getX(i), height - 5);
      }
    });

    const legendX = width - 100;
    const legendY = 8;
    const legendW = 92;
    const legendH = 34;

    ctx.fillStyle = colors.legendBg;
    ctx.strokeStyle = colors.legendBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendW, legendH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '11px -apple-system, sans-serif';

    ctx.fillStyle = colors.temp;
    ctx.fillText('— Temperatura', legendX + 10, legendY + 15);

    ctx.fillStyle = colors.feels;
    ctx.fillText('— Sensação', legendX + 10, legendY + 28);
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

  function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
  }

  function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  }

  function showError(msg) {
    hideLoading();
    document.getElementById('error').textContent = msg;
    document.getElementById('error').classList.remove('hidden');
  }
})();
