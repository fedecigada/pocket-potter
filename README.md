# Pocket Potter

Pocket Potter is a collectible card web app set in the Harry Potter universe. Users register, buy
virtual credits, spend them on card packs, and fill an album of character cards. Duplicates can be
sold back for credits or put up on a peer-to-peer trade board, where another collector can accept a
one-for-one swap. Character data comes from the public HP-API and is snapshotted into MongoDB, so
the card list is fixed and the same for everyone.

Live demo: https://pocket-potter.vercel.app

## Screenshots

<!-- TODO: screenshots -->

## Features

- Register and sign in with an optional favourite house.
- Buy virtual credits, then open a pack (5 cards, 1 credit) or a maxi pack (9 cards, 3 credits).
- Album grid showing every card in the collection: owned cards in colour with a copy counter,
  missing cards greyed out, click an owned card to flip it.
- Dashboard with credits, cards collected out of the full collection, completed trades and a
  completion bar.
- Sell a duplicate back for 1 credit; the last copy of a card cannot be sold.
- Trade board: offer one of your duplicates for a card you are missing, accept other players'
  offers, cancel your own pending ones, and review completed trades.
- Searchable character guide with house, species, ancestry, patronus and wand.

## Tech stack

Frontend

- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- React Router

Backend

- Node.js, Express
- MongoDB (official Node driver)
- JWT authentication, bcryptjs password hashing
- Swagger UI, generated with swagger-autogen

## Project history

The project was built for a university Web and Mobile Programming exam, originally against the
Marvel API. When those endpoints were retired the app was migrated to the Harry Potter API, which
meant reworking the data model and the seed scripts. The frontend was later rewritten from vanilla
JavaScript and Bootstrap to React, TypeScript, Tailwind and shadcn/ui, consuming the existing
Express API unchanged.

## Running locally

Prerequisites

- Node.js (the backend uses the global `fetch`, so Node 18 or newer)
- A MongoDB database: a MongoDB Atlas cluster or a local instance

Install

Dependencies live in two places, so `npm install` has to be run twice:

```bash
npm install
npm install --prefix client
```

Configure

Copy both example files and fill in the blanks:

```bash
cp .env.example .env
cp client/.env.example client/.env
```

- `.env`: set `DB_URI`, `DB_NAME` and `JWT_SECRET`. `HP_API_URL`, `JWT_EXPIRES_IN`, `PORT` and
  `FRONTEND_URL` already carry working local defaults.
- `client/.env`: `VITE_API_URL` can be left empty for local development - the Vite dev server
  proxies `/api` to `http://localhost:3100`.

Seed the database

`newCardCollection.js` fetches the characters from the HP-API into `card_collection`;
`newUserIndex.js` creates the unique index on user emails.

```bash
node src/db/newCardCollection.js
node src/db/newUserIndex.js
```

> **Warning**
> Both scripts are destructive. `newCardCollection.js` rebuilds `card_collection` and resets
> every user's album and trades. Run them on a fresh database only.

Run

Two terminals are needed:

```bash
# terminal 1, repository root: API on http://localhost:3100
node app.js
```

```bash
# terminal 2: frontend on http://localhost:5173
cd client
npm run dev
```

## API documentation

The API is documented with Swagger UI, served by the backend at
[http://localhost:3100/api-docs](http://localhost:3100/api-docs). The spec is generated from the
annotations in `app.js`; regenerate `src/swagger/swagger-output.json` after changing a route with:

```bash
node src/swagger/swagger_gen.js
```

## Deployment

- Frontend: Vercel, as a static build of `client/` (`npm run build`), with `VITE_API_URL` set to
  the backend URL.
- Backend: Render, free tier, running `node app.js`, with the root `.env` values set as environment
  variables. `FRONTEND_URL` must match the deployed frontend origin or CORS will reject its
  requests.
- Database: MongoDB Atlas.

The free Render instance sleeps after a period of inactivity, so the first request after a pause
can take up to a minute while it wakes up.

## Status

A personal portfolio project, feature-complete and actively developed. Not a product.

## Known limitations

These are understood trade-offs rather than open bugs:

- No connection pooling: each controller opens and closes its own MongoDB connection.
- Trade acceptance uses an atomic `findOneAndUpdate` with a `processing` lock, but the follow-up
  writes are not wrapped in a transaction.
- The JWT has no refresh token: it expires after 7 days and the user logs in again.
- The seed script rebuilds the card collection and clears every user's album and trades, so it is
  not safe to run against real data.
- Two moderate DoS advisories in `qs` (transitive, via Express 4) are unpatched, because fixing
  them requires upgrading to Express 5.

## Possible improvements

- Dark theme: the CSS variables exist, but nothing toggles the `dark` class on `<html>`.
- Trade proposals are asymmetric: accepting a trade for a card you already own is allowed behind a
  confirmation dialog, but proposing one is blocked. Lifting the block would mean reworking the card
  picker so it stays clear which cards you are missing.
- Trade board filters: the API already supports `?search=` and `?house=`, the frontend does not
  use them yet.

## Credits

Built by Federico Cigada ([fedecigada](https://github.com/fedecigada)).

- Character data from the [HP-API](https://hp-api.onrender.com).
- Cinzel by Natanael Gama, licensed under the SIL Open Font License. The license file is bundled at
  `client/src/assets/fonts/Cinzel/OFL.txt`.
- Harry P by GemFonts / Typotheticals, distributed as freeware on
  [DaFont](https://www.dafont.com/harry-p.font). No license file ships with the download.
