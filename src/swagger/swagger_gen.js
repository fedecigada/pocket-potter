const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'PocketPotter API',
    description: 'Swagger for the PocketPotter project',
  },
  host: 'localhost:3100',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description:
        'Paste: Bearer YOUR_TOKEN (include the word Bearer and a space)',
    },
  },
  tags: [
    {
      name: 'User',
      description: 'Operations related to user management',
    },
    {
      name: 'Album',
      description: 'Operations related to the sticker album management',
    },
    {
      name: 'Shop',
      description: 'Operations related to purchases and sales',
    },
    {
      name: 'Characters',
      description: 'Operations related to Harry Potter characters',
    },
    {
      name: 'Exchange',
      description: 'Operations related to sticker exchanges between users',
    },
  ],
  definitions: {
    RegisterRequest: {
      username: 'mario.rossi',
      email: 'mario@example.com',
      password: 'password123',
      housePreference: 'Gryffindor',
    },
    LoginRequest: {
      email: 'mario@example.com',
      password: 'password123',
    },
    UpdateAccountRequest: {
      username: 'new_username',
      email: 'new@email.com',
      housePreference: 'Slytherin',
      password: 'newPassword123',
    },
    AccountStatistics: {
      totalCards: 15,
      uniqueCards: 10,
      duplicateCards: 5,
      totalCollectionSize: 25,
      completionPercentage: 40,
      completedExchanges: 7,
      houseDistribution: [
        { house: 'Gryffindor', count: 5 },
        { house: 'Slytherin', count: 3 },
      ],
    },
    DuplicateCard: {
      hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
      name: 'Harry Potter',
      image: 'https://hp-api.herokuapp.com/images/harry.jpg',
      quantity: 3,
      availableForTrade: 2,
    },
    PurchaseCreditsRequest: {
      credits: 1,
    },
    ExchangeRequest: {
      offeredHpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
      requestedHpId: 'a1b2c3d4-0000-1111-2222-333344445555',
    },
    ExchangeResponse: {
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
      status: 'pending',
    },
    AcceptExchangeRequest: {
      exchangeId: '507f1f77bcf86cd799439011',
    },
    User: {
      _id: '507f1f77bcf86cd799439011',
      username: 'mario.rossi',
      email: 'mario@example.com',
      housePreference: 'Gryffindor',
      credits: 0,
      album: [
        {
          hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
          name: 'Harry Potter',
          image: 'https://hp-api.herokuapp.com/images/harry.jpg',
          quantity: 2,
        },
      ],
    },
    Character: {
      hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
      index: 1,
      name: 'Harry Potter',
      house: 'Gryffindor',
      image: 'https://hp-api.herokuapp.com/images/harry.jpg',
    },
    CharacterDetails: {
      name: 'Harry Potter',
      house: 'Gryffindor',
      species: 'human',
      ancestry: 'half-blood',
      patronus: 'stag',
      wand: { wood: 'holly', core: 'phoenix feather', length: 11 },
    },
    Card: {
      hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
      name: 'Harry Potter',
      image: 'https://hp-api.herokuapp.com/images/harry.jpg',
    },
    SellStickerRequest: {
      hpId: '9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8',
    },
    SellStickerResponse: {
      message: 'Card sold successfully',
      remainingCredits: 5,
    },
  },
};

const outputFile = './src/swagger/swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
