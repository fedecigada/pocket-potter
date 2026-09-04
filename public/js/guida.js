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

function createCharacterCard(character) {
  return `
    <div class="col-12 mb-3">
      <div class="card hero-card" style="cursor: pointer"
        onclick="goToDetails('${character.hpId}', ${character.index})">
        <div class="row g-0">
          <div class="col-md-3 col-lg-2 position-relative">
            <span class="position-absolute top-0 start-0 badge rounded-pill bg-primary m-2">
              #${character.index}
            </span>
            <img src="${character.image}"
              class="img-fluid rounded-start hero-image"
              alt="${character.name}">
          </div>
          <div class="col-md-9 col-lg-10">
            <div class="card-body">
              <h5 class="card-title">${character.name}</h5>
              <p class="card-text">${character.house || 'Casata sconosciuta'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// eslint-disable-next-line no-unused-vars
function goToDetails(hpId, index) {
  window.location.href = `/dettaglio-carta.html?id=${hpId}&index=${index}`;
}

async function loadCharacters() {
  const container = document.getElementById('heroesContainer');
  const spinner = document.getElementById('loadingSpinner');

  try {
    const response = await fetchWithAuth('/api/characters');
    if (!response.ok) {
      throw new Error('Errore nel recupero dei personaggi');
    }
    const data = await response.json();
    spinner.style.display = 'none';

    const cardsHTML = data.characters
      .map((character) => createCharacterCard(character))
      .join('');
    container.innerHTML = cardsHTML;
  } catch (error) {
    console.error('Errore nel caricamento dei personaggi:', error);
    spinner.style.display = 'none';
    container.innerHTML =
      '<div class="alert alert-danger">Errore nel caricamento dei personaggi. Riprova più tardi.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  loadCharacters();
});
