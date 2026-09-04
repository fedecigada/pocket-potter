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

// eslint-disable-next-line no-unused-vars
async function buyCredits() {
  if (confirm('Vuoi acquistare 1 credito per 1€?')) {
    try {
      const resp = await fetchWithAuth('/api/purchase-credits', {
        method: 'POST',
        body: JSON.stringify({ credits: 1 }),
      });

      const data = await resp.json();
      if (resp.ok) {
        alert('Credito acquistato con successo!');
        getUserInfo();
      } else {
        alert(data.error || "Errore durante l'acquisto");
      }
    } catch (err) {
      console.error('Errore acquisto crediti:', err);
      alert("Errore durante l'acquisto");
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function buyPack() {
  if (confirm('Vuoi acquistare un pacchetto per 1 credito?')) {
    try {
      const resp = await fetchWithAuth('/api/purchase-pack', {
        method: 'POST',
      });

      const data = await resp.json();
      if (resp.ok) {
        localStorage.setItem('currentPack', JSON.stringify(data.cards));
        window.location.href = 'pack-opening.html';
      } else {
        alert(data.error || 'Crediti insufficienti');
      }
    } catch (err) {
      console.error('Errore acquisto pacchetto:', err);
      alert("Errore durante l'acquisto");
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function buyMaxiPack() {
  const password = prompt(
    'Inserisci la password di amministrazione per il pacchetto maxi:',
  );
  if (password) {
    try {
      const resp = await fetchWithAuth('/api/admin/special-pack', {
        method: 'POST',
        body: JSON.stringify({
          adminPassword: password,
        }),
      });

      const data = await resp.json();
      if (resp.ok) {
        localStorage.setItem('currentPack', JSON.stringify(data.cards));
        window.location.href = 'pack-opening.html';
      } else {
        alert('Password errata o crediti insufficienti');
      }
    } catch (err) {
      console.error('Errore acquisto pacchetto maxi:', err);
      alert("Errore durante l'acquisto");
    }
  }
}

document.addEventListener('DOMContentLoaded', getUserInfo);
