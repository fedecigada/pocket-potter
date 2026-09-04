const BASE_URL = process.env.HP_API_URL || 'https://hp-api.onrender.com';

async function getAllCharacters() {
  const response = await fetch(`${BASE_URL}/api/characters`);
  if (!response.ok) {
    throw new Error(`Errore API Harry Potter: ${response.status}`);
  }
  return response.json();
}

async function getCharacterById(id) {
  const response = await fetch(`${BASE_URL}/api/character/${id}`);
  if (!response.ok) {
    throw new Error(`Errore API Harry Potter: ${response.status}`);
  }
  return response.json();
}

async function getAllSpells() {
  const response = await fetch(`${BASE_URL}/api/spells`);
  if (!response.ok) {
    throw new Error(`Errore API Harry Potter: ${response.status}`);
  }
  return response.json();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getAllCharacters,
  getCharacterById,
  getAllSpells,
  getRandomInt,
};
