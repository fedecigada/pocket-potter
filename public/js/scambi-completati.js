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

const exchangesList = document.getElementById('exchangesList');
const noExchanges = document.getElementById('noExchanges');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

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

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('d-none');
  successMessage.classList.add('d-none');
}

async function createExchangeCard(exchange) {
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Scambio Completato</h5>
          <div class="mb-3">
            <strong>Carta Offerta:</strong>
            <div class="mt-2">
              ${exchange.offeredCardName}
            </div>
          </div>
          <div class="mb-3">
            <strong>Carta Ricevuta:</strong>
            <div class="mt-2">
              ${exchange.requestedCardName}
            </div>
          </div>
          <div class="mb-3">
            <strong>Accettato da:</strong>
            <div class="mt-2">
              ${exchange.acceptorName || 'Utente sconosciuto'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadCompletedExchanges() {
  try {
    const response = await fetchWithAuth('/api/exchange/completed');
    const data = await response.json();

    if (response.ok) {
      if (data.exchanges && data.exchanges.length > 0) {
        const cards = await Promise.all(
          data.exchanges.map((exchange) => createExchangeCard(exchange)),
        );
        exchangesList.innerHTML = cards.join('');
        noExchanges.classList.add('d-none');
      } else {
        exchangesList.innerHTML = '';
        noExchanges.classList.remove('d-none');
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento degli scambi:', error);
    showError('Errore nel caricamento degli scambi completati');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  loadCompletedExchanges();
});
