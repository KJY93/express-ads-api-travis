// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { startDatabase } = require('./database/mongo');
const { insertAd, getAds, deleteAd, updateAd } = require('./database/ads');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');    

// Express instance
const app = express();

// Adding Helmet to enhance API's security
app.use(helmet());

// Using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// Enabling cors
app.use(cors());

// Adding morgan to log HTTP requests
app.use(morgan('combined'));

// Resources
app.get('/', async (req, res) => {
    res.send(await getAds());
});

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-3w55ajdw.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://express-ads-api',
  issuer: 'https://dev-3w55ajdw.us.auth0.com/',
  algorithms: ['RS256']
});

app.use(jwtCheck);

app.post('/', async (req, res) => {
    const newAd = req.body;
    await insertAd(newAd);
    res.send({ message: 'New ad inserted.' });
});

app.delete('/:id', async (req, res) => {
    await deleteAd(req.params.id);
    res.send({ message: 'Ad removed.' });
});

app.put('/:id', async (req, res) => {
    const updatedAd = req.body;
    await updateAd(req.params.id, updatedAd);
    res.send({ message: 'Ad updated.' });
});

// Start the in-memory MongoDB instance
startDatabase().then(async() => {
    await insertAd({title: 'Hello, now from the in-memory database!'});

    app.listen(3000, async () => {
        console.info('Application started on PORT 3000.');
    });
});