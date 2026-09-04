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

function showAlert(message, type = 'danger') {
  const alertDiv = document.getElementById('alertMessage');
  alertDiv.className = `alert alert-${type} mt-3`;
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';
  setTimeout(() => (alertDiv.style.display = 'none'), 8000);
}

async function loadAccountDetails() {
  try {
    const response = await fetchWithAuth('/api/account');
    const data = await response.json();

    if (response.ok) {
      document.getElementById('userCredits').textContent = data.account.credits;
      document.getElementById('welcomeMessage').textContent =
        `Benvenuto, ${data.account.username}!`;

      document.getElementById('userUsername').textContent =
        data.account.username;
      document.getElementById('userEmail').textContent = data.account.email;
      document.getElementById('userHouse').textContent =
        data.account.housePreference || 'Non specificata';
      document.getElementById('detailCredits').textContent =
        data.account.credits;
      document.getElementById('totalCards').textContent =
        data.account.statistics.totalCards;
      document.getElementById('uniqueCards').textContent =
        data.account.statistics.uniqueCards;
      document.getElementById('duplicateCards').textContent =
        data.account.statistics.duplicateCards;
      document.getElementById('completionPercentage').textContent =
        data.account.statistics.completionPercentage;

      document.getElementById('editUsername').value = data.account.username;
      document.getElementById('editEmail').value = data.account.email;
      document.getElementById('editHouse').value =
        data.account.housePreference || '';
    }
  } catch {
    showAlert("Errore nel caricamento dei dati dell'account");
  }
}

// eslint-disable-next-line no-unused-vars
function showEditForm() {
  document.getElementById('accountSection').style.display = 'none';
  document.getElementById('editSection').style.display = 'block';
}

function cancelEdit() {
  document.getElementById('editSection').style.display = 'none';
  document.getElementById('accountSection').style.display = 'block';
}

// eslint-disable-next-line no-unused-vars
async function updateAccount() {
  const userData = {
    username: document.getElementById('editUsername').value,
    email: document.getElementById('editEmail').value,
    housePreference: document.getElementById('editHouse').value,
  };

  const password = document.getElementById('editPassword').value;
  if (password) userData.password = password;

  try {
    const response = await fetchWithAuth('/api/account/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      await loadAccountDetails();
      cancelEdit();
      showAlert(data.message, 'success');
    } else {
      showAlert(data.message || "Errore nell'aggiornamento dell'account");
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Errore nella comunicazione con il server');
  }
}

// eslint-disable-next-line no-unused-vars
function confirmDelete() {
  if (
    confirm(
      'Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.',
    )
  ) {
    deleteAccount();
  }
}

async function deleteAccount() {
  try {
    const response = await fetchWithAuth('/api/account/delete', {
      method: 'DELETE',
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem('user');
      window.location.href = '/index.html';
    } else {
      showAlert(data.error || "Errore nell'eliminazione dell'account");
    }
  } catch {
    showAlert('Errore di connessione al server');
  }
}

document.addEventListener('DOMContentLoaded', loadAccountDetails);
