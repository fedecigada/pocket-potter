// NB: fetchWithAuth è definita in public/js/api.js che viene importato come script nelle pagine html
// se utente già loggato porta a dashboard
const token = localStorage.getItem('token');
if (token) {
  window.location.href = '/dashboard.html';
}

function showLoginForm() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('registrationSection').style.display = 'none';
  clearMessages();
  clearForms();
}

// eslint-disable-next-line no-unused-vars
function showRegistrationForm() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registrationSection').style.display = 'block';
  clearMessages();
  clearForms();
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';
}

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  document.getElementById('errorMessage').style.display = 'none';
}

function clearMessages() {
  document.getElementById('errorMessage').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
}

function clearForms() {
  document.getElementById('loginForm').reset();
  document.getElementById('registrationForm').reset();
}

// eslint-disable-next-line no-unused-vars
async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetchWithAuth('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Errore durante il login');
    }
    showSuccess('Login effettuato con successo');
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard.html';
  } catch (error) {
    showError(error.message);
  }
}

// eslint-disable-next-line no-unused-vars
async function handleRegistration() {
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const housePreference = document.getElementById('regHouse').value;

  try {
    const response = await fetchWithAuth('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        housePreference,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Errore durante la registrazione');
    }
    showSuccess('Registrazione completata con successo');
  } catch (error) {
    showError(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showLoginForm();
});
