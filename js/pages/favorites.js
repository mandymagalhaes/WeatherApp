(function () {
  document.addEventListener('DOMContentLoaded', () => {
    STORE.initTheme();
    renderFavorites();
  });

  function renderFavorites() {
    const list = document.getElementById('fav-list');
    const empty = document.getElementById('fav-empty');
    const favorites = STORE.getFavorites();

    list.innerHTML = '';

    if (favorites.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    favorites.forEach((fav) => {
      const card = document.createElement('div');
      card.className = 'fav-card';

      const info = document.createElement('div');
      info.className = 'fav-info';

      const name = document.createElement('span');
      name.className = 'fav-name';
      name.textContent = fav.name;

      const country = document.createElement('span');
      country.className = 'fav-country';
      country.textContent = fav.country;

      info.appendChild(name);
      info.appendChild(country);

      const actions = document.createElement('div');
      actions.className = 'fav-actions';

      const viewBtn = document.createElement('a');
      viewBtn.className = 'btn-link';
      viewBtn.textContent = 'Ver clima';
      const params = new URLSearchParams({
        lat: fav.latitude,
        lon: fav.longitude,
        name: fav.name,
        country: fav.country,
      });
      viewBtn.href = `/?${params}`;

      const detailsBtn = document.createElement('a');
      detailsBtn.className = 'btn-link';
      detailsBtn.textContent = 'Detalhes';
      detailsBtn.href = `details.html?${params}`;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-icon';
      removeBtn.textContent = '🗑️';
      removeBtn.title = 'Remover';
      removeBtn.addEventListener('click', () => {
        STORE.removeFavorite(fav.latitude, fav.longitude);
        renderFavorites();
      });

      actions.appendChild(viewBtn);
      actions.appendChild(detailsBtn);
      actions.appendChild(removeBtn);

      card.appendChild(info);
      card.appendChild(actions);
      list.appendChild(card);
    });
  }
})();
