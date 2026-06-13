(function () {
  let currentLat = null;
  let currentLon = null;
  let currentName = '';
  let currentCountry = '';

  document.addEventListener('DOMContentLoaded', () => {
    STORE.initTheme();

    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lon = parseFloat(params.get('lon'));
    const name = params.get('name') || '';
    const country = params.get('country') || '';

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
    const favIcon = document.getElementById('detail-fav-icon');
    if (window.lucide) lucide.createIcons();

    favBtn.addEventListener('click', () => {
      if (currentLat === null) return;
      if (STORE.isFavorite(currentLat, currentLon)) {
        STORE.removeFavorite(currentLat, currentLon);
        favIcon.classList.remove('fav-filled');
      } else {
        STORE.addFavorite({
          name: currentName,
          country: currentCountry,
          latitude: currentLat,
          longitude: currentLon,
        });
        favIcon.classList.add('fav-filled');
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
    favIcon.classList.toggle('fav-filled', STORE.isFavorite(lat, lon));
  }

  function renderCurrent(data) {
    const current = data.current;
    const info = getWeatherInfo(current.weather_code);

    document.getElementById('detail-icon').textContent = info.icon;
    document.getElementById('detail-temp').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('detail-desc').textContent = info.desc;
    document.getElementById('detail-feels').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('detail-humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('detail-wind').textContent = `${current.wind_speed_10m} km/h`;

    document.getElementById('detail-current').classList.remove('hidden');
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
        info.icon,
        `${Math.round(hourly.temperature_2m[i])}°`,
        `${Math.round(hourly.apparent_temperature[i])}°`,
        `${hourly.wind_speed_10m[i]} km/h`,
        `${hourly.relative_humidity_2m[i]}%`,
        `${hourly.precipitation_probability[i] ?? 0}%`,
      ];

      cells.forEach((c) => {
        const cell = document.createElement('span');
        cell.className = 'hourly-cell';
        cell.textContent = c;
        row.appendChild(cell);
      });

      table.appendChild(row);
    }

    document.getElementById('detail-hourly').classList.remove('hidden');
    drawChart(hourly);
  }

  function drawChart(hourly) {
    const canvas = document.getElementById('hourly-chart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 32;
    const height = 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

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

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let t = Math.ceil(minTemp); t <= Math.floor(maxTemp); t += 5) {
      const y = getY(t);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${t}°`, padding.left - 4, y + 4);
    }

    function drawLine(data, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
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

    drawLine(temps, '#fff');
    drawLine(feels, 'rgba(255,255,100,0.7)');

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    temps.forEach((_, i) => {
      if (i % 3 === 0 || i === temps.length - 1) {
        const hour = new Date(hourly.time[i] + 'Z').getHours();
        ctx.fillText(`${hour}h`, getX(i), height - 5);
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillRect(width - 90, 5, 85, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('— Temperatura', width - 80, 18);
    ctx.fillStyle = 'rgba(255,255,100,0.7)';
    ctx.fillText('— Sensação', width - 80, 30);
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
