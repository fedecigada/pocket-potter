const MongoClient = require('mongodb').MongoClient;
const harryPotterAPI = require('../controllers/harryPotterAPI');
require('dotenv').config();

/*
  Fetches all characters from the Harry Potter API, keeps only those
  with a valid image, and saves them to the "card_collection" in MongoDB,
  preserving the API order (which reflects character importance).
  Resets every user's album and all exchanges.
*/
async function extractAndSaveCharacters() {
  let client;
  try {
    const uri = process.env.DB_URI;
    const dbName = process.env.DB_NAME;

    // Fetch all characters from the API
    const allCharacters = await harryPotterAPI.getAllCharacters();
    console.log('Total characters available:', allCharacters.length);

    // Keep only those with a valid image, preserving API order
    const validCharacters = allCharacters.filter(
      (character) => character.image && character.image.trim() !== '',
    );
    console.log('Characters with a valid image:', validCharacters.length);

    // Connect to MongoDB
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    // Empty every user's album
    const usersCollection = db.collection('users');
    await usersCollection.updateMany(
      { album: { $exists: true } },
      { $set: { album: [] } },
    );

    // Clear exchanges and the old collection
    await db.collection('exchanges').deleteMany({});
    await db.collection('card_collection').deleteMany({});

    // Build the documents, index based on API order (1-based)
    const docs = validCharacters.map((character, index) => ({
      hpId: character.id,
      index: index + 1,
      name: character.name,
      house: character.house || 'Unknown',
      image: character.image,
      wand: character.wand || {},
      patronus: character.patronus || '',
      species: character.species || '',
      ancestry: character.ancestry || '',
    }));

    const result = await db.collection('card_collection').insertMany(docs);
    console.log(
      'Inserted ' +
        result.insertedCount +
        " documents into the 'card_collection'.",
    );
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

extractAndSaveCharacters();
