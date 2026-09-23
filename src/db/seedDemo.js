const MongoClient = require('mongodb').MongoClient;
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const saltRounds = 10;
const OWNED_CARDS = 18;
const DUPLICATE_CARDS = 3;

const DEMO_USER = {
  username: 'demo',
  email: 'demo@pocketpotter.dev',
  password: 'Nimbus2000!',
  housePreference: 'Gryffindor',
  credits: 4,
};

const FAKE_USERS = [
  {
    username: 'hermione_g',
    email: 'hermione@pocketpotter.dev',
    housePreference: 'Gryffindor',
  },
  {
    username: 'ron_w',
    email: 'ron@pocketpotter.dev',
    housePreference: 'Gryffindor',
  },
  {
    username: 'luna_l',
    email: 'luna@pocketpotter.dev',
    housePreference: 'Ravenclaw',
  },
];

function albumEntry(card, quantity) {
  return { hpId: card.hpId, name: card.name, image: card.image, quantity };
}

/*
  Rebuilds the demo world: the demo account, three fake collectors and
  their pending trades. Never touches card_collection.
*/
async function seedDemoState(db) {
  const cards = await db
    .collection('card_collection')
    .find({})
    .sort({ index: 1 })
    .toArray();

  if (cards.length < OWNED_CARDS + FAKE_USERS.length) {
    throw new Error(
      'card_collection is too small: run newCardCollection.js first',
    );
  }

  const demoUsers = await db
    .collection('users')
    .find({ isDemo: true })
    .project({ _id: 1 })
    .toArray();
  const demoIds = demoUsers.map((user) => user._id);

  await db.collection('exchanges').deleteMany({
    $or: [{ proposer: { $in: demoIds } }, { acceptor: { $in: demoIds } }],
  });
  await db.collection('users').deleteMany({ isDemo: true });

  const hashedPassword = await bcryptjs.hash(DEMO_USER.password, saltRounds);

  // The first cards are duplicated, so the demo can accept a trade right away
  const demoAlbum = cards
    .slice(0, OWNED_CARDS)
    .map((card, i) => albumEntry(card, i < DUPLICATE_CARDS ? 3 : 1));

  const demoResult = await db.collection('users').insertOne({
    username: DEMO_USER.username,
    email: DEMO_USER.email,
    password: hashedPassword,
    housePreference: DEMO_USER.housePreference,
    credits: DEMO_USER.credits,
    album: demoAlbum,
    isDemo: true,
  });

  // Each fake user owns two copies of a card the demo is missing
  const missingCards = cards.slice(OWNED_CARDS);

  const fakeUsers = FAKE_USERS.map((user, i) => ({
    ...user,
    password: hashedPassword,
    credits: 0,
    isDemo: true,
    album: [albumEntry(missingCards[i], 2), albumEntry(cards[i], 1)],
  }));

  const fakeResult = await db.collection('users').insertMany(fakeUsers);

  const exchanges = FAKE_USERS.map((user, i) => {
    const offered = missingCards[i];
    const requested = cards[i];

    return {
      proposer: fakeResult.insertedIds[i],
      proposerName: user.username,
      offeredHpId: offered.hpId,
      offeredCardName: offered.name,
      offeredImage: offered.image,
      offeredHouse: offered.house,
      requestedHpId: requested.hpId,
      requestedCardName: requested.name,
      requestedImage: requested.image,
      requestedHouse: requested.house,
      status: 'pending',
    };
  });

  await db.collection('exchanges').insertMany(exchanges);

  console.log(`Demo account: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  console.log(`Album: ${demoAlbum.length} of ${cards.length} cards`);
  console.log(`Pending trades: ${exchanges.length}`);

  return { demoId: demoResult.insertedId };
}

async function runFromTerminal() {
  let client;
  try {
    client = await MongoClient.connect(process.env.DB_URI);
    await seedDemoState(client.db(process.env.DB_NAME));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

if (require.main === module) {
  runFromTerminal();
}

module.exports = { seedDemoState, DEMO_USER };
