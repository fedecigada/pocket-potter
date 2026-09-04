// NB: fetchWithAuth è definita in public/js/api.js che viene importato come script nelle pagine html
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

let currentIndex = 0;
const cards = JSON.parse(localStorage.getItem('currentPack') || '[]');

if (!cards.length) {
  window.location.href = 'shop.html';
}

function updateCard() {
  const card = cards[currentIndex];
  document.getElementById('cardImage').src = card.image;
  document.getElementById('cardName').textContent = card.name;
  document.getElementById('currentCard').textContent = currentIndex + 1;
  document.getElementById('totalCards').textContent = cards.length;
}

// eslint-disable-next-line no-unused-vars
function nextCard() {
  if (currentIndex < cards.length - 1) {
    currentIndex++;
    updateCard();
  }
}

// eslint-disable-next-line no-unused-vars
function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCard();
  }
}

document.addEventListener('DOMContentLoaded', updateCard);
