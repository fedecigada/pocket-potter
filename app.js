const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/swagger/swagger-output.json');
const authMiddleware = require('./src/middleware/auth');
require('dotenv').config();

const userController = require('./src/controllers/userController');
const shopController = require('./src/controllers/shopController');
const tradeController = require('./src/controllers/tradeController');
const characterController = require('./src/controllers/characterController');
const extraController = require('./src/controllers/extraController');

const uri = process.env.DB_URI;
const dbName = process.env.DB_NAME;

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// User
app.post('/api/register', async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Register a new user. username, email and password are required; housePreference is optional. credits starts at 0 and album starts empty.'
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'User registration data',
      required: true,
      schema: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
              username: { type: 'string', example: 'mario.rossi' },
              email: { type: 'string', example: 'mario@example.com' },
              password: { type: 'string', example: 'password123' },
              housePreference: { type: 'string', example: 'Gryffindor' }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'User registered successfully; user is the stored document without the password field',
      schema: {
          message: 'User registered successfully',
          user: {
              _id: '507f1f77bcf86cd799439011',
              username: 'mario.rossi',
              email: 'mario@example.com',
              housePreference: 'Gryffindor',
              credits: 0,
              album: []
          }
      }
  }
  #swagger.responses[400] = {
      description: 'username, email or password missing ("All fields are required"), or the email is already registered ("Email already registered")',
      schema: { error: 'All fields are required' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.register(req, res, uri, dbName);
});

app.post('/api/login', async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Login and receive a JWT token'
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Login credentials',
      required: true,
      schema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
              email: { type: 'string', example: 'mario@example.com' },
              password: { type: 'string', example: 'password123' }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'Login successful; user is the stored user document without the password field',
      schema: {
          message: 'Login successful',
          user: {
              _id: '507f1f77bcf86cd799439011',
              username: 'mario.rossi',
              email: 'mario@example.com',
              housePreference: 'Gryffindor',
              credits: 100,
              album: [{
                  hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
                  name: 'Harry Potter',
                  image: 'https://hp-api.herokuapp.com/images/harry.jpg',
                  quantity: 2
              }]
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
  }
  #swagger.responses[400] = {
      description: 'email or password missing (error: "Email and password are required"), or unknown email or wrong password (message: "Invalid credentials")',
      schema: { message: 'Invalid credentials' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.login(req, res, uri, dbName);
});

app.put('/api/account/update', authMiddleware, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Update authenticated user account details. Every field is optional; only the fields present in the body are changed. Sending an empty body results in a server error.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Fields to update; each one is optional',
      required: true,
      schema: {
          type: 'object',
          properties: {
              username: { type: 'string', example: 'new_username' },
              email: { type: 'string', example: 'new@email.com' },
              housePreference: { type: 'string', example: 'Slytherin' },
              password: { type: 'string', example: 'newPassword123' }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'Account updated successfully; user is the updated user document without the password field',
      schema: {
          message: 'Account updated successfully',
          user: {
              _id: '507f1f77bcf86cd799439011',
              username: 'new_username',
              email: 'new@email.com',
              housePreference: 'Slytherin',
              credits: 100,
              album: [{
                  hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
                  name: 'Harry Potter',
                  image: 'https://hp-api.herokuapp.com/images/harry.jpg',
                  quantity: 2
              }]
          }
      }
  }
  #swagger.responses[400] = {
      description: 'The chosen email is already used by another account',
      schema: { error: 'Email already in use' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.updateAccount(req, res, uri, dbName);
});

app.delete('/api/account/delete', authMiddleware, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Delete the authenticated user account'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Account deleted successfully',
      schema: { message: 'Account deleted successfully' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.deleteAccount(req, res, uri, dbName);
});

app.get('/api/account', authMiddleware, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Get authenticated user account details including credits and collection statistics'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Account details retrieved successfully',
      schema: {
          message: 'Account details retrieved successfully',
          account: {
              username: 'mario.rossi',
              email: 'mario@example.com',
              housePreference: 'Gryffindor',
              credits: 100,
              statistics: {
                  totalCards: 15,
                  uniqueCards: 10,
                  duplicateCards: 5,
                  totalCollectionSize: 25,
                  completionPercentage: 40,
                  completedExchanges: 7,
                  houseDistribution: [
                      { house: 'Gryffindor', count: 5 },
                      { house: 'Slytherin', count: 3 }
                  ]
              }
          }
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.getAccount(req, res, uri, dbName);
});

// Album
app.get('/api/album', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Album']
  // #swagger.description = 'Get the full album: one entry per card in the collection, sorted by index. Owned cards carry the stored image and a quantity greater than 0; cards not yet owned have image null and quantity 0.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Album retrieved successfully',
      schema: {
          message: 'Album retrieved successfully',
          album: [
              {
                  hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
                  name: 'Harry Potter',
                  image: 'https://hp-api.herokuapp.com/images/harry.jpg',
                  quantity: 2,
                  index: 1,
                  house: 'Gryffindor'
              },
              {
                  hpId: 'a1b2c3d4-0000-1111-2222-333344445555',
                  index: 2,
                  name: 'Hermione Granger',
                  house: 'Gryffindor',
                  image: null,
                  quantity: 0
              }
          ]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.getAlbum(req, res, uri, dbName);
});

app.get('/api/album/duplicates', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Album']
  // #swagger.description = 'Get the cards the user owns in more than one copy (quantity greater than 1). availableForTrade is quantity minus 1.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Duplicate cards retrieved successfully',
      schema: {
          message: 'Duplicate cards retrieved successfully',
          duplicates: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              name: 'Harry Potter',
              image: 'https://hp-api.herokuapp.com/images/harry.jpg',
              quantity: 3,
              availableForTrade: 2
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.getDuplicates(req, res, uri, dbName);
});

// Shop
app.post('/api/purchase-credits', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Add virtual credits to the authenticated user. The returned credits value is the new balance, not the amount added.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Number of credits to add; must be a positive number',
      required: true,
      schema: {
          type: 'object',
          required: ['credits'],
          properties: {
              credits: { type: 'number', example: 1 }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'Credits added successfully; credits is the new balance',
      schema: { message: 'Credits purchased', credits: 5 }
  }
  #swagger.responses[400] = {
      description: 'credits is missing, zero or negative',
      schema: { error: 'credits (positive) is required' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await shopController.purchaseCredits(req, res, uri, dbName);
});

app.post('/api/purchase-pack', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Buy a standard pack: 5 random cards drawn from the collection, costs 1 credit. Takes no request body. Cards are added to the album (quantity incremented if already owned).'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Pack purchased successfully; cards always has 5 entries and may contain repeats',
      schema: {
          message: 'Pack purchased successfully',
          cards: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              name: 'Harry Potter',
              image: 'https://hp-api.herokuapp.com/images/harry.jpg'
          }],
          remainingCredits: 4
      }
  }
  #swagger.responses[400] = {
      description: 'The user has fewer than 1 credit',
      schema: { message: 'Insufficient credits' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error. Returns { error: "No characters available" } when the card collection is empty, otherwise { error: <underlying error message> }',
      schema: { error: 'No characters available' }
  }
  */
  await shopController.purchasePack(req, res, uri, dbName);
});

// Characters
app.get('/api/characters', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Characters']
  // #swagger.description = 'Get every card in the collection, sorted by index ascending. Each item carries _id, hpId, index, name, house and image.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Characters retrieved successfully',
      schema: {
          characters: [{
              _id: '507f1f77bcf86cd799439011',
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              index: 1,
              name: 'Harry Potter',
              house: 'Gryffindor',
              image: 'https://hp-api.herokuapp.com/images/harry.jpg'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Error retrieving characters' }
  }
  */
  await characterController.getCharacters(req, res, uri, dbName);
});

app.get('/api/characters/detail/:id', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Characters']
  // #swagger.description = 'Get basic info for a single card, looked up by hpId. Returns hpId, index, name, house and image.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'The card hpId (UUID)',
      required: true,
      example: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8'
  } */
  /*
  #swagger.responses[200] = {
      description: 'Character retrieved successfully',
      schema: {
          hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
          index: 1,
          name: 'Harry Potter',
          house: 'Gryffindor',
          image: 'https://hp-api.herokuapp.com/images/harry.jpg'
      }
  }
  #swagger.responses[400] = {
      description: 'The id path segment is empty',
      schema: { error: 'Character ID is required' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'No card has this hpId',
      schema: { message: 'Character not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Error retrieving character' }
  }
  */
  await characterController.getCharacterById(req, res, uri, dbName);
});

app.get('/api/characters/details/:id', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Characters']
  // #swagger.description = 'Get full details for a single card, looked up by hpId. Returns name, house, species, ancestry, patronus and wand.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'The card hpId (UUID)',
      required: true,
      example: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8'
  } */
  /*
  #swagger.responses[200] = {
      description: 'Character details retrieved successfully',
      schema: {
          name: 'Harry Potter',
          house: 'Gryffindor',
          species: 'human',
          ancestry: 'half-blood',
          patronus: 'stag',
          wand: { wood: 'holly', core: 'phoenix feather', length: 11 }
      }
  }
  #swagger.responses[400] = {
      description: 'The id path segment is empty',
      schema: { error: 'Character ID is required' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'No card has this hpId',
      schema: { message: 'Character not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Error retrieving details' }
  }
  */
  await characterController.getCharacterDetails(req, res, uri, dbName);
});

// Exchange
app.post('/api/exchange/propose', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Propose a 1-for-1 card trade. Only offeredHpId and requestedHpId are read from the body; card names, images and houses are resolved server-side from the collection. The proposer must hold at least 2 copies of the offered card and must not already own the requested card.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'hpId of the offered card and hpId of the requested card',
      required: true,
      schema: {
          type: 'object',
          required: ['offeredHpId', 'requestedHpId'],
          properties: {
              offeredHpId: { type: 'string', example: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8' },
              requestedHpId: { type: 'string', example: 'a1b2c3d4-0000-1111-2222-333344445555' }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'Trade proposed successfully; exchange is the stored document',
      schema: {
          message: 'Exchange proposed',
          exchange: {
              _id: '507f1f77bcf86cd799439011',
              proposer: '507f1f77bcf86cd799439012',
              offeredHpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              offeredCardName: 'Harry Potter',
              offeredImage: 'https://hp-api.herokuapp.com/images/harry.jpg',
              offeredHouse: 'Gryffindor',
              requestedHpId: 'a1b2c3d4-0000-1111-2222-333344445555',
              requestedCardName: 'Hermione Granger',
              requestedImage: 'https://hp-api.herokuapp.com/images/hermione.jpg',
              requestedHouse: 'Gryffindor',
              status: 'pending'
          }
      }
  }
  #swagger.responses[400] = {
      description: 'offeredHpId or requestedHpId missing ("offeredHpId and requestedHpId are required"); the two ids are equal ("The offered and requested cards must be different"); the proposer holds 1 or 0 copies of the offered card ("You do not have enough copies of <name>"); or the proposer already owns the requested card ("You already own <name>")',
      schema: { message: 'You do not have enough copies of Harry Potter' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'One or both hpId values are not in the collection ("One or both cards do not exist"), or the proposer user document is missing ("User not found")',
      schema: { message: 'One or both cards do not exist' }
  }
  #swagger.responses[500] = {
      description: 'Server error; always returns this fixed body',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.proposeExchange(req, res, uri, dbName);
});

app.post('/api/exchange/accept', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Accept a pending trade proposal. The exchange is locked by moving it from pending to processing with an atomic findOneAndUpdate so two users cannot accept it at once; on any validation failure below the status is reset to pending, and on success it becomes completed with acceptor and acceptorName set. The acceptor must hold at least 2 copies of the requested card.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'ID of the exchange to accept',
      required: true,
      schema: {
          type: 'object',
          required: ['exchangeId'],
          properties: {
              exchangeId: { type: 'string', example: '507f1f77bcf86cd799439011' }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'Trade completed successfully',
      schema: { message: 'Exchange completed successfully' }
  }
  #swagger.responses[400] = {
      description: 'The proposer no longer holds a duplicate of the offered card ("The proposer no longer has a duplicate of <name>"), or the acceptor does not hold a duplicate of the requested card ("You do not have a duplicate of <name>")',
      schema: { message: 'The proposer no longer has a duplicate of Harry Potter' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'The proposer or acceptor user document is missing',
      schema: { message: 'User not found' }
  }
  #swagger.responses[409] = {
      description: 'The exchange does not exist or is no longer pending (already being processed or accepted by another user)',
      schema: { message: 'Exchange not found or already accepted by another user' }
  }
  #swagger.responses[500] = {
      description: 'Server error; always returns this fixed body',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.acceptExchange(req, res, uri, dbName);
});

app.get('/api/exchanges', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Get pending exchanges proposed by other users (the caller\'s own proposals are excluded), optionally filtered by house and/or card name'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['house'] = {
      in: 'query',
      description: 'Optional. Keeps exchanges whose offeredHouse or requestedHouse equals this value exactly (e.g. Gryffindor)',
      required: false,
      type: 'string'
  } */
  /* #swagger.parameters['search'] = {
      in: 'query',
      description: 'Optional. Case-insensitive partial (regex) match on offeredCardName or requestedCardName',
      required: false,
      type: 'string'
  } */
  /*
  #swagger.responses[200] = {
      description: 'Available exchanges retrieved successfully; each item is a full exchange document',
      schema: {
          message: 'Available exchanges retrieved successfully',
          exchanges: [{
              _id: '507f1f77bcf86cd799439011',
              proposer: '507f1f77bcf86cd799439012',
              offeredHpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              offeredCardName: 'Harry Potter',
              offeredImage: 'https://hp-api.herokuapp.com/images/harry.jpg',
              offeredHouse: 'Gryffindor',
              requestedHpId: 'a1b2c3d4-0000-1111-2222-333344445555',
              requestedCardName: 'Hermione Granger',
              requestedImage: 'https://hp-api.herokuapp.com/images/hermione.jpg',
              requestedHouse: 'Gryffindor',
              status: 'pending'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.getExchanges(req, res, uri, dbName);
});

app.get('/api/exchange/user', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Get the pending exchanges proposed by the authenticated user. Only proposals with status pending are returned.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'User exchanges retrieved successfully; each item is a full exchange document',
      schema: {
          message: 'User exchanges retrieved successfully',
          exchanges: [{
              _id: '507f1f77bcf86cd799439011',
              proposer: '507f1f77bcf86cd799439012',
              offeredHpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              offeredCardName: 'Harry Potter',
              offeredImage: 'https://hp-api.herokuapp.com/images/harry.jpg',
              offeredHouse: 'Gryffindor',
              requestedHpId: 'a1b2c3d4-0000-1111-2222-333344445555',
              requestedCardName: 'Hermione Granger',
              requestedImage: 'https://hp-api.herokuapp.com/images/hermione.jpg',
              requestedHouse: 'Gryffindor',
              status: 'pending'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.getUserExchanges(req, res, uri, dbName);
});

app.get('/api/exchange/completed', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Get the completed exchanges the authenticated user took part in, as either proposer or acceptor'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Completed exchanges retrieved successfully; each item is a full exchange document with acceptor and acceptorName set',
      schema: {
          message: 'Completed exchanges retrieved successfully',
          exchanges: [{
              _id: '507f1f77bcf86cd799439011',
              proposer: '507f1f77bcf86cd799439012',
              offeredHpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              offeredCardName: 'Harry Potter',
              offeredImage: 'https://hp-api.herokuapp.com/images/harry.jpg',
              offeredHouse: 'Gryffindor',
              requestedHpId: 'a1b2c3d4-0000-1111-2222-333344445555',
              requestedCardName: 'Hermione Granger',
              requestedImage: 'https://hp-api.herokuapp.com/images/hermione.jpg',
              requestedHouse: 'Gryffindor',
              status: 'completed',
              acceptor: '507f1f77bcf86cd799439013',
              acceptorName: 'luigi.verdi'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; always returns this fixed body',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.getCompletedExchanges(req, res, uri, dbName);
});

app.delete('/api/exchange/:exchangeId', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Delete a pending exchange proposal. Only the proposer can cancel, and only while the exchange is still pending; the document is removed from the collection.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['exchangeId'] = {
      in: 'path',
      description: 'The exchange _id',
      required: true,
      example: '507f1f77bcf86cd799439011'
  } */
  /*
  #swagger.responses[200] = {
      description: 'Exchange cancelled successfully',
      schema: { message: 'Exchange cancelled successfully' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[403] = {
      description: 'The caller is not the proposer of this exchange',
      schema: { message: 'Only the proposer can cancel the exchange' }
  }
  #swagger.responses[404] = {
      description: 'No pending exchange with this id (it does not exist or is already completed)',
      schema: { message: 'Exchange not found or already completed' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.cancelExchange(req, res, uri, dbName);
});

// Shop Extra
app.post('/api/sell-sticker', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Sell one copy of an owned card for 1 credit. The card quantity drops by 1 and credits rise by 1. The last copy cannot be sold. remainingCredits in the response is the new balance.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'hpId of the card to sell',
      required: true,
      schema: {
          type: 'object',
          required: ['hpId'],
          properties: {
              hpId: { type: 'string', example: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8' }
          }
      }
  } */
  /*
  #swagger.responses[200] = {
      description: 'Card sold successfully; remainingCredits is the new balance',
      schema: { message: 'Card sold successfully', remainingCredits: 5 }
  }
  #swagger.responses[400] = {
      description: 'The user owns only one copy of this card',
      schema: { message: 'You cannot sell the last copy of a card' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'The user does not exist or does not own a card with this hpId',
      schema: { message: 'User or card not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error; the error field carries the underlying error message',
      schema: { error: 'Internal server error' }
  }
  */
  await extraController.sellSticker(req, res, uri, dbName);
});

app.post('/api/purchase-maxi-pack', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Buy a maxi pack: 9 random cards drawn from the collection, costs 3 credits. Takes no request body. Cards are added to the album (quantity incremented if already owned).'
  // #swagger.security = [{ "bearerAuth": [] }]
  /*
  #swagger.responses[200] = {
      description: 'Maxi pack purchased successfully; cards always has 9 entries and may contain repeats',
      schema: {
          message: 'Maxi pack purchased successfully',
          cards: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              name: 'Harry Potter',
              image: 'https://hp-api.herokuapp.com/images/harry.jpg'
          }],
          remainingCredits: 3
      }
  }
  #swagger.responses[400] = {
      description: 'The user has fewer than 3 credits',
      schema: { message: 'Insufficient credits' }
  }
  #swagger.responses[401] = {
      description: 'Missing, malformed, invalid or expired token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error. Returns { error: "No characters available" } when the card collection is empty, otherwise { error: <underlying error message> }',
      schema: { error: 'No characters available' }
  }
  */
  await extraController.purchaseMaxiPack(req, res, uri, dbName);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
