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

const form = document.getElementById('exchangeForm');
const offeredCardSelect = document.getElementById('offeredCard');
const requestedCardSelect = document.getElementById('requestedCard');
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

async function loadDuplicateCards() {
  try {
    const response = await fetchWithAuth(`/api/album/duplicates`);
    const data = await response.json();

    if (response.ok) {
      offeredCardSelect.innerHTML =
        '<option value="">Seleziona una carta</option>';
      data.duplicates.forEach((card) => {
        if (card.availableForTrade > 0) {
          const option = document.createElement('option');
          option.value = JSON.stringify({
            hpId: card.hpId,
            name: card.name,
            image: card.image,
          });
          option.textContent = `${card.name} (${card.availableForTrade} disponibili)`;
          offeredCardSelect.appendChild(option);
        }
      });
    }
  } catch (error) {
    console.error('Errore nel caricamento delle carte duplicate:', error);
    showError('Errore nel caricamento delle carte duplicate');
  }
}

async function loadAllCards() {
  try {
    const response = await fetchWithAuth('/api/album');
    const data = await response.json();

    if (response.ok) {
      requestedCardSelect.innerHTML =
        '<option value="">Seleziona una carta</option>';

      data.album.forEach((card) => {
        const option = document.createElement('option');
        option.value = JSON.stringify({
          hpId: card.hpId,
          name: card.name,
          image: card.image,
        });
        option.textContent = `${card.name} (#${card.index})`;
        requestedCardSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Errore nel caricamento delle carte:', error);
    showError('Errore nel caricamento delle carte disponibili');
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const offeredCard = JSON.parse(offeredCardSelect.value);
  const requestedCard = JSON.parse(requestedCardSelect.value);

  if (!offeredCard || !requestedCard) {
    showError('Seleziona entrambe le carte per lo scambio');
    return;
  }

  try {
    const response = await fetchWithAuth('/api/exchange/propose', {
      method: 'POST',
      body: JSON.stringify({
        offeredHpId: offeredCard.hpId,
        offeredCardName: offeredCard.name,
        offeredImage: offeredCard.image,
        requestedHpId: requestedCard.hpId,
        requestedCardName: requestedCard.name,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess('Scambio proposto con successo');
      form.reset();
    } else {
      showError(data.message || 'Errore nella proposta di scambio');
    }
  } catch (error) {
    console.error("Errore nell'invio della proposta:", error);
    showError('Errore nella proposta di scambio');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  loadDuplicateCards();
  loadAllCards();
});
