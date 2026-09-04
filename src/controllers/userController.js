const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

async function register(req, res, uri, dbName) {
  let client;
  try {
    const { username, email, password, housePreference } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    const newUser = {
      username,
      email,
      password: hashedPassword,
      housePreference,
      credits: 0,
      album: [],
    };
    const result = await db.collection('users').insertOne(newUser);
    delete newUser.password;
    newUser._id = result.insertedId;
    res.json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function login(req, res, uri, dbName) {
  let client;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    delete user.password;

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function updateAccount(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;
    const { username, email, housePreference, password } = req.body;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (housePreference) updateFields.housePreference = housePreference;
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, saltRounds);
      updateFields.password = hashedPassword;
    }

    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: ObjectId.createFromHexString(userId) },
        { $set: updateFields },
        { returnDocument: 'after' },
      );

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    delete result.password;
    res.json({
      message: 'Account updated successfully',
      user: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function deleteAccount(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const result = await db
      .collection('users')
      .findOneAndDelete({ _id: ObjectId.createFromHexString(userId) });

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getAccount(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- Base statistics: simple counts on the embedded album array ---
    const totalCollectionSize = await db
      .collection('card_collection')
      .countDocuments();

    const uniqueCards = user.album ? user.album.length : 0;
    const totalCards = user.album
      ? user.album.reduce((sum, card) => sum + card.quantity, 0)
      : 0;
    const duplicateCards = totalCards - uniqueCards;

    // --- Completed exchanges count ---
    // The user can take part either as proposer or acceptor, so $or matches
    // both roles. countDocuments returns just the number (no documents fetched).
    // userId comes from the token as a string, but proposer/acceptor are stored
    // as ObjectId, so it must be converted with createFromHexString to match.
    const completedExchanges = await db.collection('exchanges').countDocuments({
      status: 'completed',
      $or: [
        { proposer: ObjectId.createFromHexString(userId) },
        { acceptor: ObjectId.createFromHexString(userId) },
      ],
    });

    // --- House distribution: aggregation pipeline ---
    // House lives in card_collection, not in the user's album, so we cannot
    // group on the album alone — we join the two collections.
    //   $match:   keep only this user (placed first to limit the data early)
    //   $unwind:  split the album array into one document per owned card,
    //             so the next stages can work card-by-card
    //   $lookup:  join each card to card_collection by hpId to get its house;
    //             result lands in cardInfo as an array (always, even for one match)
    //   $group:   group by house and sum quantities (duplicates count too);
    //             $arrayElemAt pulls house out of the single-element cardInfo array
    const houseDistributionRaw = await db
      .collection('users')
      .aggregate([
        { $match: { _id: ObjectId.createFromHexString(userId) } },
        { $unwind: '$album' },
        {
          $lookup: {
            from: 'card_collection',
            localField: 'album.hpId',
            foreignField: 'hpId',
            as: 'cardInfo',
          },
        },
        {
          $group: {
            _id: { $arrayElemAt: ['$cardInfo.house', 0] },
            count: { $sum: '$album.quantity' },
          },
        },
      ])
      .toArray();

    // Rename the group key (_id) to a clearer "house" for the API response
    const houseDistribution = houseDistributionRaw.map((entry) => ({
      house: entry._id,
      count: entry.count,
    }));

    const accountDetails = {
      username: user.username,
      email: user.email,
      housePreference: user.housePreference,
      credits: user.credits,
      statistics: {
        totalCards,
        uniqueCards,
        duplicateCards,
        completionPercentage:
          totalCollectionSize > 0
            ? Math.round((uniqueCards / totalCollectionSize) * 100)
            : 0,
        completedExchanges,
        houseDistribution,
      },
    };

    res.json({
      message: 'Account details retrieved successfully',
      account: accountDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getAlbum(req, res, uri, dbName) {
  let client;
  try {
    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db
      .collection('users')
      .findOne(
        { _id: ObjectId.createFromHexString(req.userId) },
        { projection: { album: 1 } },
      );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allCards = await db
      .collection('card_collection')
      .find({})
      .sort({ index: 1 })
      .toArray();

    const album = allCards.map((card) => {
      const userCard = user.album?.find((owned) => owned.hpId === card.hpId);

      if (userCard) {
        return {
          ...userCard,
          index: card.index,
          house: card.house,
        };
      }

      return {
        hpId: card.hpId,
        index: card.index,
        name: card.name,
        house: card.house,
        image: null,
        quantity: 0,
      };
    });

    res.json({
      message: 'Album retrieved successfully',
      album,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function getDuplicates(req, res, uri, dbName) {
  let client;
  try {
    const userId = req.userId;

    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const user = await db
      .collection('users')
      .findOne(
        { _id: ObjectId.createFromHexString(userId) },
        { projection: { album: 1 } },
      );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const duplicates = user.album
      ? user.album
          .filter((card) => card.quantity > 1)
          .map((card) => ({
            ...card,
            availableForTrade: card.quantity - 1,
          }))
      : [];

    res.json({
      message: 'Duplicate cards retrieved successfully',
      duplicates,
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
  register,
  login,
  updateAccount,
  deleteAccount,
  getAccount,
  getAlbum,
  getDuplicates,
};
