const MongoClient = require('mongodb').MongoClient;

async function getCharacters(req, res, uri, dbName) {
  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    const characters = await db
      .collection('card_collection')
      .find({})
      .sort({ index: 1 })
      .project({ hpId: 1, index: 1, name: 1, house: 1, image: 1 })
      .toArray();

    res.json({ characters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving characters' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getCharacterById(req, res, uri, dbName) {
  let client;
  try {
    const hpId = req.params.id;

    if (!hpId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const character = await db
      .collection('card_collection')
      .findOne({ hpId: hpId });

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({
      hpId: character.hpId,
      index: character.index,
      name: character.name,
      house: character.house,
      image: character.image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving character' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getCharacterDetails(req, res, uri, dbName) {
  let client;
  try {
    const hpId = req.params.id;

    if (!hpId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const character = await db
      .collection('card_collection')
      .findOne({ hpId: hpId });

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({
      name: character.name,
      house: character.house,
      species: character.species,
      ancestry: character.ancestry,
      patronus: character.patronus,
      wand: character.wand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving details' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

module.exports = {
  getCharacters,
  getCharacterById,
  getCharacterDetails,
};
