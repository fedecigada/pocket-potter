const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

async function proposeExchange(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const { offeredHpId, requestedHpId } = req.body;

    if (!offeredHpId || !requestedHpId) {
      return res
        .status(400)
        .json({ message: 'offeredHpId and requestedHpId are required' });
    }
    if (offeredHpId === requestedHpId) {
      return res.status(400).json({
        message: 'The offered and requested cards must be different',
      });
    }

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    // Retrieve both cards from the collection (source of truth)
    const cards = await db
      .collection('card_collection')
      .find({ hpId: { $in: [offeredHpId, requestedHpId] } })
      .toArray();

    const offeredFromCollection = cards.find((c) => c.hpId === offeredHpId);
    const requestedFromCollection = cards.find((c) => c.hpId === requestedHpId);

    if (!offeredFromCollection || !requestedFromCollection) {
      return res
        .status(404)
        .json({ message: 'One or both cards do not exist' });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const offeredCard = user.album.find((c) => c.hpId === offeredHpId);
    if (!offeredCard || offeredCard.quantity <= 1) {
      return res.status(400).json({
        message: `You do not have enough copies of ${offeredFromCollection.name}`,
      });
    }

    const requestedCard = user.album.find((c) => c.hpId === requestedHpId);
    if (requestedCard && requestedCard.quantity > 0) {
      return res
        .status(400)
        .json({ message: `You already own ${requestedFromCollection.name}` });
    }

    const newExchange = {
      proposer: ObjectId.createFromHexString(userId),
      offeredHpId,
      offeredCardName: offeredFromCollection.name,
      offeredImage: offeredFromCollection.image,
      offeredHouse: offeredFromCollection.house,
      requestedHpId,
      requestedCardName: requestedFromCollection.name,
      requestedImage: requestedFromCollection.image,
      requestedHouse: requestedFromCollection.house,
      status: 'pending',
    };

    const result = await db.collection('exchanges').insertOne(newExchange);

    res.json({
      message: 'Exchange proposed',
      exchange: { ...newExchange, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error proposing exchange:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function acceptExchange(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const { exchangeId } = req.body;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    async function resetExchange() {
      await db
        .collection('exchanges')
        .updateOne(
          { _id: ObjectId.createFromHexString(exchangeId) },
          { $set: { status: 'pending' } },
        );
    }

    // Handle concurrency with atomic MongoDB operation (findOneAndUpdate):
    // lock the exchange by moving it to 'processing' so two users cannot accept it at once
    const exchange = await db.collection('exchanges').findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(exchangeId),
        status: 'pending',
      },
      { $set: { status: 'processing' } },
      { returnDocument: 'after' },
    );

    if (!exchange) {
      return res.status(409).json({
        message: 'Exchange not found or already accepted by another user',
      });
    }

    const proposer = await db
      .collection('users')
      .findOne({ _id: exchange.proposer });
    const acceptor = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(userId) });

    if (!proposer || !acceptor) {
      await resetExchange();
      return res.status(404).json({ message: 'User not found' });
    }

    const proposerCard = proposer.album.find(
      (c) => c.hpId === exchange.offeredHpId,
    );
    if (!proposerCard || proposerCard.quantity <= 1) {
      await resetExchange();
      return res.status(400).json({
        message: `The proposer no longer has a duplicate of ${exchange.offeredCardName}`,
      });
    }

    const acceptorCard = acceptor.album.find(
      (c) => c.hpId === exchange.requestedHpId,
    );
    if (!acceptorCard || acceptorCard.quantity <= 1) {
      await resetExchange();
      return res.status(400).json({
        message: `You do not have a duplicate of ${exchange.requestedCardName}`,
      });
    }

    if (acceptor.album.some((c) => c.hpId === exchange.offeredHpId)) {
      await resetExchange();
      return res
        .status(400)
        .json({ message: `You already own ${exchange.offeredCardName}` });
    }

    // The six card-moving operations below are not wrapped in a MongoDB
    // transaction (known limitation). The 'processing' lock above prevents
    // concurrent acceptance; on validation failure the status is reset to 'pending'.
    // Proposer: remove offered card
    await db
      .collection('users')
      .updateOne(
        { _id: exchange.proposer, 'album.hpId': exchange.offeredHpId },
        { $inc: { 'album.$.quantity': -1 } },
      );

    // Proposer: increment requested card if already present
    await db
      .collection('users')
      .updateOne(
        { _id: exchange.proposer, 'album.hpId': exchange.requestedHpId },
        { $inc: { 'album.$.quantity': 1 } },
      );

    // Proposer: add requested card if not present
    await db.collection('users').updateOne(
      {
        _id: exchange.proposer,
        'album.hpId': { $ne: exchange.requestedHpId },
      },
      {
        $push: {
          album: {
            hpId: exchange.requestedHpId,
            name: exchange.requestedCardName,
            image: acceptorCard.image,
            quantity: 1,
          },
        },
      },
    );

    // Acceptor: remove requested card
    await db.collection('users').updateOne(
      {
        _id: ObjectId.createFromHexString(userId),
        'album.hpId': exchange.requestedHpId,
      },
      { $inc: { 'album.$.quantity': -1 } },
    );

    // Acceptor: increment offered card if already present
    await db.collection('users').updateOne(
      {
        _id: ObjectId.createFromHexString(userId),
        'album.hpId': exchange.offeredHpId,
      },
      { $inc: { 'album.$.quantity': 1 } },
    );

    // Acceptor: add offered card if not present
    await db.collection('users').updateOne(
      {
        _id: ObjectId.createFromHexString(userId),
        'album.hpId': { $ne: exchange.offeredHpId },
      },
      {
        $push: {
          album: {
            hpId: exchange.offeredHpId,
            name: exchange.offeredCardName,
            image: exchange.offeredImage,
            quantity: 1,
          },
        },
      },
    );

    await db.collection('exchanges').updateOne(
      { _id: ObjectId.createFromHexString(exchangeId) },
      {
        $set: {
          status: 'completed',
          acceptor: ObjectId.createFromHexString(userId),
          acceptorName: acceptor.username,
        },
      },
    );

    res.json({ message: 'Exchange completed successfully' });
  } catch (error) {
    console.error('Error accepting exchange:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getExchanges(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const { house, search } = req.query;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    // Base filter: pending exchanges proposed by other users
    const filter = {
      status: 'pending',
      proposer: { $ne: ObjectId.createFromHexString(userId) },
    };

    // Optional house filter: match either the offered or the requested card's house
    if (house) {
      filter.$or = [{ offeredHouse: house }, { requestedHouse: house }];
    }

    // Optional search filter: case-insensitive match on either card name
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$and = [
        { $or: [{ offeredCardName: regex }, { requestedCardName: regex }] },
      ];
    }

    const exchanges = await db.collection('exchanges').find(filter).toArray();

    res.json({
      message: 'Available exchanges retrieved successfully',
      exchanges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getUserExchanges(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const exchanges = await db
      .collection('exchanges')
      .find({
        proposer: ObjectId.createFromHexString(userId),
        status: 'pending',
      })
      .toArray();

    res.json({
      message: 'User exchanges retrieved successfully',
      exchanges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getCompletedExchanges(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db.collection('users').findOne({
      _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const completedExchanges = await db
      .collection('exchanges')
      .find({
        $and: [
          {
            $or: [
              { proposer: ObjectId.createFromHexString(userId) },
              { acceptor: ObjectId.createFromHexString(userId) },
            ],
          },
          { status: 'completed' },
        ],
      })
      .toArray();

    res.json({
      message: 'Completed exchanges retrieved successfully',
      exchanges: completedExchanges,
    });
  } catch (error) {
    console.error('Error retrieving completed exchanges:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function cancelExchange(req, res, uri, dbName) {
  let client;
  try {
    const exchangeId = req.params.exchangeId;
    const userId = req.userId;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const exchange = await db.collection('exchanges').findOne({
      _id: ObjectId.createFromHexString(exchangeId),
      status: 'pending',
    });
    if (!exchange) {
      return res
        .status(404)
        .json({ message: 'Exchange not found or already completed' });
    }
    if (exchange.proposer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the proposer can cancel the exchange' });
    }

    await db
      .collection('exchanges')
      .deleteOne({ _id: ObjectId.createFromHexString(exchangeId) });

    res.json({ message: 'Exchange cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

module.exports = {
  proposeExchange,
  acceptExchange,
  getExchanges,
  getUserExchanges,
  getCompletedExchanges,
  cancelExchange,
};
