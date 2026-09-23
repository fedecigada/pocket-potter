const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const { seedDemoState } = require('../db/seedDemo');

/*
  Resets the demo world and returns a token for the demo account.
  Takes no input: the account is fixed in the seed script.
*/
async function demoLogin(req, res, uri, dbName) {
  let client;
  try {
    client = await new MongoClient(uri).connect();
    const db = client.db(dbName);

    const { demoId } = await seedDemoState(db);

    const token = jwt.sign(
      { userId: demoId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({ message: 'Demo session ready', token });
  } catch (error) {
    console.error('Error starting demo session:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

module.exports = { demoLogin };
