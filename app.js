const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// User
app.post('/api/register', async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Register a new user'
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
      description: 'User registered successfully',
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
      description: 'Bad request',
      schema: { error: 'All fields are required' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
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
      description: 'Login successful',
      schema: {
          message: 'Login successful',
          user: {
              _id: '507f1f77bcf86cd799439011',
              username: 'mario.rossi',
              email: 'mario@example.com'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
  }
  #swagger.responses[400] = {
      description: 'Invalid credentials',
      schema: { message: 'Invalid credentials' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.login(req, res, uri, dbName);
});

app.put('/api/account/update', authMiddleware, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Update authenticated user account details'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Fields to update (all optional)',
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
      description: 'Account updated successfully',
      schema: { message: 'Account updated successfully', user: {} }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.updateAccount(req, res, uri, dbName);
});

app.delete('/api/account/delete', authMiddleware, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Delete the authenticated user account'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'Account deleted successfully',
      schema: { message: 'Account deleted successfully' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.deleteAccount(req, res, uri, dbName);
});

app.get('/api/account', authMiddleware, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Get authenticated user account details including credits and collection statistics'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
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
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.getAccount(req, res, uri, dbName);
});

// Album
app.get('/api/album', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Album']
  // #swagger.description = 'Get the full album with owned and missing cards'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'Album retrieved successfully',
      schema: {
          message: 'Album retrieved successfully',
          album: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              index: 1,
              name: 'Harry Potter',
              house: 'Gryffindor',
              image: 'https://hp-api.herokuapp.com/images/harry.jpg',
              quantity: 2
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.getAlbum(req, res, uri, dbName);
});

app.get('/api/album/duplicates', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Album']
  // #swagger.description = 'Get duplicate cards available for trading or selling'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'Duplicate cards retrieved successfully',
      schema: {
          message: 'Duplicate cards retrieved successfully',
          duplicates: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              name: 'Harry Potter',
              image: 'url',
              quantity: 3,
              availableForTrade: 2
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await userController.getDuplicates(req, res, uri, dbName);
});

// Shop
app.post('/api/purchase-credits', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Purchase virtual credits'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Number of credits to purchase',
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
      description: 'Credits purchased successfully',
      schema: { message: 'Credits purchased', credits: 5 }
  }
  #swagger.responses[400] = {
      description: 'Bad request',
      schema: { error: 'credits (positive number) is required' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await shopController.purchaseCredits(req, res, uri, dbName);
});

app.post('/api/purchase-pack', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Purchase a standard pack (5 random cards, costs 1 credit)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'Pack purchased successfully',
      schema: {
          message: 'Pack purchased successfully',
          cards: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              name: 'Harry Potter',
              image: 'url'
          }],
          remainingCredits: 4
      }
  }
  #swagger.responses[400] = {
      description: 'Insufficient credits',
      schema: { message: 'Insufficient credits' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await shopController.purchasePack(req, res, uri, dbName);
});

// Characters
app.get('/api/characters', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Characters']
  // #swagger.description = 'Get all characters in the collection'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'Characters retrieved successfully',
      schema: {
          characters: [{
              hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              index: 1,
              name: 'Harry Potter',
              house: 'Gryffindor',
              image: 'url'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Failed to retrieve characters' }
  }
  */
  await characterController.getCharacters(req, res, uri, dbName);
});

app.get('/api/characters/detail/:id', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Characters']
  // #swagger.description = 'Get basic info for a single character'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'HP character ID (UUID)',
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
          image: 'url'
      }
  }
  #swagger.responses[400] = {
      description: 'Missing ID',
      schema: { error: 'Character ID is required' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'Character not found',
      schema: { message: 'Character not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Failed to retrieve character' }
  }
  */
  await characterController.getCharacterById(req, res, uri, dbName);
});

app.get('/api/characters/details/:id', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Characters']
  // #swagger.description = 'Get full character details (house, wand, patronus, ancestry)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'HP character ID (UUID)',
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
      description: 'Missing ID',
      schema: { error: 'Character ID is required' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'Character not found',
      schema: { message: 'Character not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Failed to retrieve character details' }
  }
  */
  await characterController.getCharacterDetails(req, res, uri, dbName);
});

// Exchange
app.post('/api/exchange/propose', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Propose a 1-for-1 card trade (cards identified by hpId; name, image and house are resolved server-side)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'IDs of the offered and requested cards',
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
      description: 'Trade proposed successfully',
      schema: {
          message: 'Exchange proposed',
          exchange: {
              _id: '507f1f77bcf86cd799439011',
              offeredHpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
              offeredCardName: 'Harry Potter',
              offeredImage: 'url',
              offeredHouse: 'Gryffindor',
              requestedHpId: 'a1b2c3d4-0000-1111-2222-333344445555',
              requestedCardName: 'Hermione Granger',
              requestedImage: 'url',
              requestedHouse: 'Gryffindor',
              status: 'pending'
          }
      }
  }
  #swagger.responses[400] = {
      description: 'Bad request',
      schema: { message: 'Not enough copies of the offered card' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.proposeExchange(req, res, uri, dbName);
});

app.post('/api/exchange/accept', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Accept a trade proposal (uses atomic operation for concurrency handling)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'ID of the trade to accept',
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
      description: 'Card no longer available',
      schema: { message: 'Proposer no longer has the offered duplicate card' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[409] = {
      description: 'Trade already accepted by another user',
      schema: { message: 'Exchange not found or already accepted by another user' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.acceptExchange(req, res, uri, dbName);
});

app.get('/api/exchanges', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Get available trades (excluding the user\'s own), optionally filtered by house and/or card name'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['house'] = {
      in: 'query',
      description: 'Optional. Filter by house, matching either the offered or requested card (e.g. Gryffindor)',
      required: false,
      type: 'string'
  } */
  /* #swagger.parameters['search'] = {
      in: 'query',
      description: 'Optional. Case-insensitive partial match on either card name',
      required: false,
      type: 'string'
  } */
  /*
  #swagger.responses[200] = {
      description: 'Available trades retrieved successfully',
      schema: {
          message: 'Available Exchanges retrieved successfully',
          exchanges: [{
              _id: '507f1f77bcf86cd799439011',
              offeredCardName: 'Harry Potter',
              requestedCardName: 'Hermione Granger',
              status: 'pending'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.getExchanges(req, res, uri, dbName);
});

app.get('/api/exchange/user', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Get trade proposals created by the authenticated user'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'User trades retrieved successfully',
      schema: {
          message: 'User Exchanges retrieved successfully',
          exchanges: [{
              _id: '507f1f77bcf86cd799439011',
              offeredCardName: 'Harry Potter',
              requestedCardName: 'Hermione Granger',
              status: 'pending'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.getUserExchanges(req, res, uri, dbName);
});

app.get('/api/exchange/completed', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Get completed trades for the authenticated user (both proposed and accepted)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /*
  #swagger.responses[200] = {
      description: 'Completed trades retrieved successfully',
      schema: {
          message: 'Completed Exchanges retrieved successfully',
          exchanges: [{
              _id: '507f1f77bcf86cd799439011',
              offeredCardName: 'Harry Potter',
              offeredImage: 'url',
              requestedCardName: 'Hermione Granger',
              acceptorName: 'luigi.verdi',
              status: 'completed'
          }]
      }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User not found',
      schema: { message: 'User not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.getCompletedExchanges(req, res, uri, dbName);
});

app.delete('/api/exchange/:exchangeId', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Exchange']
  // #swagger.description = 'Cancel a pending trade proposal (only the proposer can cancel)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['exchangeId'] = {
      in: 'path',
      description: 'Trade proposal ID',
      required: true,
      example: '507f1f77bcf86cd799439011'
  } */
  /*
  #swagger.responses[200] = {
      description: 'Trade cancelled successfully',
      schema: { message: 'Exchange cancelled successfully' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[403] = {
      description: 'Not authorized',
      schema: { message: 'Only the proposer can cancel the Exchange' }
  }
  #swagger.responses[404] = {
      description: 'Trade not found',
      schema: { message: 'Exchange not found or already completed' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await tradeController.cancelExchange(req, res, uri, dbName);
});

// Shop Extra
app.post('/api/sell-sticker', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Sell a duplicate card for 1 credit (cannot sell the last copy)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  } */
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'ID of the card to sell',
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
      description: 'Card sold successfully',
      schema: { message: 'Card sold successfully', remainingCredits: 5 }
  }
  #swagger.responses[400] = {
      description: 'Cannot sell last copy',
      schema: { message: 'Cannot sell the last copy of a card' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[404] = {
      description: 'User or card not found',
      schema: { message: 'User or card not found' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await extraController.sellSticker(req, res, uri, dbName);
});

app.post('/api/purchase-maxi-pack', authMiddleware, async (req, res) => {
  // #swagger.tags = ['Shop']
  // #swagger.description = 'Purchase a maxi pack (9 random cards, costs 3 credits)'
  /* #swagger.parameters['Authorization'] = {
      in: 'header',
      description: 'JWT Token: Bearer <token>',
      required: true
  }*/
  /*
  #swagger.responses[200] = {
      description: 'Maxi pack purchased successfully',
      schema: {
          message: 'Maxi pack purchased successfully',
          cards: [{ hpId: 'uuid', name: 'Harry Potter', image: 'url' }],
          remainingCredits: 3
      }
  }
  #swagger.responses[400] = {
      description: 'Insufficient credits',
      schema: { message: 'Insufficient credits' }
  }
  #swagger.responses[401] = {
      description: 'Missing or invalid token',
      schema: { error: 'Missing token' }
  }
  #swagger.responses[500] = {
      description: 'Server error',
      schema: { error: 'Internal server error' }
  }
  */
  await extraController.purchaseMaxiPack(req, res, uri, dbName);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
