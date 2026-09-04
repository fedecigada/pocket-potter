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
    }
  } catch (error) {
    console.error('Errore caricamento utente:', error);
  }
}

function getCharacterId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getCharacterIndex() {
  const params = new URLSearchParams(window.location.search);
  return params.get('index');
}

function formatWand(wand) {
  if (!wand || (!wand.wood && !wand.core && !wand.length)) {
    return 'Sconosciuta';
  }
  const parts = [];
  if (wand.wood) parts.push(wand.wood);
  if (wand.core) parts.push(wand.core);
  if (wand.length) parts.push(`${wand.length} cm`);
  return parts.join(', ');
}

function createDetailContent(character, details, characterIndex) {
  return `
    <div class="col-12 mb-4">
      <button class="btn btn-primary" onclick="window.history.back()">
        <i class="bi bi-arrow-left"></i> Torna alla guida
      </button>
    </div>

    <div class="col-md-4">
      <div class="position-relative">
        <span class="position-absolute top-0 start-0 badge rounded-pill bg-primary m-2">
          #${characterIndex}
        </span>
        <img src="${character.image}"
          class="img-fluid rounded"
          alt="${character.name}">
      </div>
    </div>

    <div class="col-md-8">
      <h2>${character.name}</h2>
      <p class="lead">${details.house || 'Casata sconosciuta'}</p>

      <div class="mt-4">
        <h4>Informazioni</h4>
        <ul class="list-group mb-3">
          <li class="list-group-item">
            <strong>Specie:</strong> ${details.species || 'Sconosciuta'}
          </li>
          <li class="list-group-item">
            <strong>Discendenza:</strong> ${details.ancestry || 'Sconosciuta'}
          </li>
          <li class="list-group-item">
            <strong>Patronus:</strong> ${details.patronus || 'Sconosciuto'}
          </li>
          <li class="list-group-item">
            <strong>Bacchetta:</strong> ${formatWand(details.wand)}
          </li>
        </ul>
      </div>
    </div>
  `;
}

async function loadCharacterDetails() {
  const characterId = getCharacterId();
  const characterIndex = getCharacterIndex();
  const container = document.getElementById('heroDetail');
  const spinner = document.getElementById('loadingSpinner');

  if (!characterId) {
    container.innerHTML =
      '<div class="alert alert-danger">ID personaggio non valido</div>';
    spinner.style.display = 'none';
    return;
  }

  try {
    const [charResponse, detailsResponse] = await Promise.all([
      fetchWithAuth(`/api/characters/detail/${characterId}`),
      fetchWithAuth(`/api/characters/details/${characterId}`),
    ]);

    if (!charResponse.ok || !detailsResponse.ok) {
      throw new Error('Errore nel recupero dei dati');
    }

    const character = await charResponse.json();
    const details = await detailsResponse.json();

    container.innerHTML = createDetailContent(
      character,
      details,
      characterIndex,
    );
    container.style.display = 'flex';
    spinner.style.display = 'none';
  } catch (error) {
    console.error('Errore nel caricamento dei dettagli:', error);
    container.innerHTML =
      '<div class="alert alert-danger">Errore nel caricamento dei dettagli. Riprova più tardi.</div>';
    spinner.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  loadCharacterDetails();
});
