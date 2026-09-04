// funzione wrapper di fetch per utilizzare JWT
// eslint-disable-next-line no-unused-vars
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/index.html';
    return;
  }

  return response;
}
