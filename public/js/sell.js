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

async function loadDuplicates() {
  try {
    const resp = await fetchWithAuth('/api/album/duplicates');
    const data = await resp.json();

    if (resp.ok) {
      const select = document.getElementById('cardSelect');
      select.innerHTML = '<option value="">Seleziona una carta</option>';

      data.duplicates.forEach((card) => {
        if (card.quantity > 1) {
          const option = document.createElement('option');
          option.value = card.hpId;
          option.textContent = `${card.name} (${card.quantity} disponibili)`;
          select.appendChild(option);
        }
      });

      document.getElementById('sellButton').disabled = true;
    }
  } catch (err) {
    console.error('Errore caricamento duplicati:', err);
  }
}

// eslint-disable-next-line no-unused-vars
async function sellCard() {
  const hpId = document.getElementById('cardSelect').value;
  if (!hpId) return;

  if (confirm('Vuoi vendere questa carta per 1 credito?')) {
    try {
      const resp = await fetchWithAuth('/api/sell-sticker', {
        method: 'POST',
        body: JSON.stringify({
          hpId,
        }),
      });

      const data = await resp.json();
      if (resp.ok) {
        alert('Carta venduta con successo!');
        getUserInfo();
        loadDuplicates();
      } else {
        alert(data.error || 'Errore durante la vendita');
      }
    } catch (err) {
      console.error('Errore vendita carta:', err);
      alert('Errore durante la vendita');
    }
  }
}

document.getElementById('cardSelect').addEventListener('change', function () {
  document.getElementById('sellButton').disabled = !this.value;
});

document.addEventListener('DOMContentLoaded', () => {
  getUserInfo();
  loadDuplicates();
});
