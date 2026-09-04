const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const { getRandomInt } = require('./harryPotterAPI');

async function sellSticker(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const { hpId } = req.body;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);
    const user = await db.collection('users').findOne({
      _id: ObjectId.createFromHexString(userId),
      'album.hpId': hpId,
    });
    if (!user) {
      return res.status(404).json({ message: 'User or card not found' });
    }
    const card = user.album.find((card) => card.hpId === hpId);
    if (!card || card.quantity <= 1) {
      return res
        .status(400)
        .json({ message: 'You cannot sell the last copy of a card' });
    }

    // Decrements the card quantity in the album
    await db.collection('users').updateOne(
      {
        _id: ObjectId.createFromHexString(userId),
        'album.hpId': hpId,
      },
      { $inc: { 'album.$.quantity': -1, credits: 1 } },
    );

    // Retrieves the updated credits
    const updatedUser = await db
      .collection('users')
      .findOne(
        { _id: ObjectId.createFromHexString(userId) },
        { projection: { credits: 1 } },
      );

    res.json({
      message: 'Card sold successfully',
      remainingCredits: updatedUser.credits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function purchaseMaxiPack(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const specialPackCost = 3;
    const packSize = 9;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.credits < specialPackCost) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    const availableCards = await db
      .collection('card_collection')
      .find({})
      .toArray();
    if (!availableCards.length) {
      return res.status(500).json({ error: 'No characters available' });
    }

    // Generates a random pack from the database
    const packCards = [];
    for (let i = 0; i < packSize; i++) {
      const randomIndex = getRandomInt(0, availableCards.length - 1);
      const card = availableCards[randomIndex];

      packCards.push({
        hpId: card.hpId,
        name: card.name,
        image: card.image,
      });
    }

    // Updates existing cards or inserts them one at a time
    for (const card of packCards) {
      const result = await db.collection('users').updateOne(
        {
          _id: ObjectId.createFromHexString(userId),
          'album.hpId': card.hpId,
        },
        { $inc: { 'album.$.quantity': 1 } },
      );

      if (result.matchedCount === 0) {
        await db.collection('users').updateOne(
          { _id: ObjectId.createFromHexString(userId) },
          {
            $push: {
              album: {
                hpId: card.hpId,
                name: card.name,
                image: card.image,
                quantity: 1,
              },
            },
          },
        );
      }
    }

    // Updates the user's credits
    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: ObjectId.createFromHexString(userId) },
        { $inc: { credits: -specialPackCost } },
        { returnDocument: 'after' },
      );

    res.json({
      message: 'Maxi pack purchased successfully',
      cards: packCards,
      remainingCredits: result.credits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

module.exports = {
  sellSticker,
  purchaseMaxiPack,
};
