const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

async function newUserIndex() {
  let client;
  try {
    const uri = process.env.DB_URI;
    const dbName = process.env.DB_NAME;

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Email index created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

newUserIndex();
