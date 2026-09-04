// NB: fetchWithAuth è definita in public/js/api.js che viene importato come script nelle pagine html
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

// eslint-disable-next-line no-unused-vars
function handleLogout() {
  localStorage.removeItem('token');
  window.location.href = '/index.html';
}

async function getUserInfo() {
  try {
    const response = await fetchWithAuth('/api/account');
    const data = await response.json();

    if (response.ok) {
      document.getElementById('userCredits').textContent = data.account.credits;
      document.getElementById('welcomeMessage').textContent =
        `Benvenuto, ${data.account.username}!`;

      if (data.account.statistics) {
        document.getElementById('completionPercentage').textContent =
          `${data.account.statistics.completionPercentage}%`;
        document.getElementById('uniqueCards').textContent =
          data.account.statistics.uniqueCards;
      }
    }
  } catch (err) {
    console.error('Errore caricamento utente:', err);
  }
}

async function getAlbum() {
  try {
    const resp = await fetchWithAuth('/api/album');
    const data = await resp.json();
    if (resp.ok) renderAlbum(data.album);
  } catch (err) {
    console.error('Errore caricamento album:', err);
  }
}

function renderAlbum(album) {
  const grid = document.getElementById('albumGrid');
  grid.innerHTML = '';

  album.forEach((card) => {
    const col = document.createElement('div');
    col.className = 'col';

    if (card.quantity > 0) {
      col.innerHTML = `
        <div class="card hero-card">
          <img src="${card.image}" class="card-img-top" alt="${card.name}">
          <div class="card-body">
            <h5 class="card-title">${card.name}</h5>
          </div>
        </div>
      `;
    } else {
      col.innerHTML = `
        <div class="card-placeholder">
          <span class="text-muted">#${card.index}</span>
        </div>
      `;
    }

    grid.appendChild(col);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  getAlbum();
});
