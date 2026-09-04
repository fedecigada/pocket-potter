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

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.remove('d-none');
  errorMessage.classList.add('d-none');
}

function createExchangeCard(exchange) {
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Proposta di Scambio</h5>
          <div class="mb-3">
            <strong>Carta Offerta:</strong>
            <div class="mt-2">
              ${exchange.offeredCardName}
            </div>
          </div>
          <div class="mb-3">
            <strong>Carta Richiesta:</strong>
            <div class="mt-2">
              ${exchange.requestedCardName}
            </div>
          </div>
          <button onclick="acceptExchange('${exchange._id}')" class="btn btn-primary w-100">
            Accetta Scambio
          </button>
        </div>
      </div>
    </div>
  `;
}

async function loadAvailableExchanges() {
  try {
    const response = await fetchWithAuth('/api/exchanges');
    const data = await response.json();

    if (response.ok) {
      if (data.exchanges && data.exchanges.length > 0) {
        exchangesList.innerHTML = data.exchanges
          .map((exchange) => createExchangeCard(exchange))
          .join('');
        noExchanges.classList.add('d-none');
      } else {
        exchangesList.innerHTML = '';
        noExchanges.classList.remove('d-none');
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento degli scambi:', error);
    showError('Errore nel caricamento degli scambi disponibili');
  }
}

// eslint-disable-next-line no-unused-vars
async function acceptExchange(exchangeId) {
  if (!confirm('Sei sicuro di voler accettare questo scambio?')) {
    return;
  }

  try {
    const response = await fetchWithAuth('/api/exchange/accept', {
      method: 'POST',
      body: JSON.stringify({
        exchangeId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess('Scambio accettato con successo');
      loadAvailableExchanges();
    } else {
      showError(data.message || "Errore nell'accettare lo scambio");
    }
  } catch (error) {
    console.error("Errore nell'accettare lo scambio:", error);
    showError("Errore nell'accettare lo scambio");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  loadAvailableExchanges();
});
