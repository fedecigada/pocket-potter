const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const { getRandomInt } = require('./harryPotterAPI');

async function purchaseCredits(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const { credits } = req.body;
    if (!credits || credits <= 0) {
      return res.status(400).json({ error: 'credits (positive) is required' });
    }
    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);
    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: ObjectId.createFromHexString(userId) },
        { $inc: { credits: credits } },
        { returnDocument: 'after' },
      );
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'Credits purchased',
      credits: result.credits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function purchasePack(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const packCost = 1;
    const packSize = 5;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.credits < packCost) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    const availableCards = await db
      .collection('card_collection')
      .find({})
      .toArray();
    if (!availableCards.length) {
      return res.status(500).json({ error: 'No characters available' });
    }

    // Generate a random pack from the database
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
        { $inc: { credits: -packCost } },
        { returnDocument: 'after' },
      );

    res.json({
      message: 'Pack purchased successfully',
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
  purchaseCredits,
  purchasePack,
};
