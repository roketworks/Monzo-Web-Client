'use strict'

// Import development env vars from .env file
// NOT TO BE USED IN PRODUCTION
require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const helmet = require('helmet');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const app = express();

// Setup View engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const sess = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {path: '/', httpOnly: true}
}

if (app.get('env') === 'production') {
  const client = redis.createClient({url: process.env.REDIS_URL});
  sess.store = new RedisStore({client: client});
  sess.cookie.secure = true;
}

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sess));
app.use(express.static(path.join(__dirname, '..', 'public'))) // Setup static file hanlding for public css/js/img files

app.get('/', function (req, res) {
  res.render('index');
})

// Get Routes & Auth middleware 
const authRoute = require('./routes/auth');
const endpointRoute = require('./routes/endpoints');
const transactionRoute = require('./routes/transactions');
const mapRoute = require('./routes/map');
const authMiddleware = require('./middleware/auth');

// Register Routes
app.use('/auth', authRoute);
app.use('/endpoints', endpointRoute);
app.use('/transactions', authMiddleware, transactionRoute);
app.use('/map', authMiddleware, mapRoute);

// Setup error handling, dont display full error in production
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      status: err.status || 500,
      message: err.message,
      error: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      status: err.status || 500,
      message: err.message,
      error: null
    });
  });
}

// 404 handling
app.use(function (req, res) {
  res.render('error', {
    status: 404,
    message: 'Page not found',
    error: null
  });
});

const port = process.env.PORT || 8081;
app.listen(port);
