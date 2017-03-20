'use strict';

// Import development env vars from .env file
// NOT TO BE USED IN PRODUCTION
//import {} from 'dotenv'

import path from 'path';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import logger from 'morgan';
import helmet from 'helmet';
import redis from 'connect-redis';
import filestore from 'session-file-store';
import pug from 'pug';

// Get Routes & Auth middleware 
import authRoute from './routes/auth';
import endpointRoute from './routes/endpoints';
import transactionRoute from './routes/transactions';
import budgetRoute from './routes/budget';
import mapRoute from './routes/map';
import settingsRoute from './routes/settings';
import authMiddleware from './middleware/auth';

const app = express();

// Setup View engine
app.set('views', path.join(__dirname, 'views'));

// production view engine will server precompile pug views for speed
// Otherwise views will be rendered as requested
if (app.get('env') === 'production') {
  app.engine('js', (filePath, options, callback) =>{
    var f = require(filePath);
    let data = f(options, pug.runtime);
    callback(null, data);
  });

  app.set('view engine', 'js');
} else {
  app.set('view engine', 'pug');
}

const sess = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {path: '/', httpOnly: true}
};

if (app.get('env') === 'production') {
  // TODO: look at secure cookies only, possobily need to set proxy options when running on herkou
  const RedisStore = redis(session);
  sess.store = new RedisStore({url: process.env.REDIS_URL});
} else {
  const FileStore = filestore(session);
  sess.store = new FileStore();
}

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sess));
app.use('/static', express.static(path.join(__dirname, '..', 'public'))); // Setup static file hanlding for public css/js/img files

app.get('/', function (req, res) {
  res.render('index', {title: 'Monzo Web Client'});
});

// Register Routes
app.use('/auth', authRoute);
app.use('/endpoints', endpointRoute);
app.use('/transactions', authMiddleware, transactionRoute);
app.use('/budgeting', authMiddleware, budgetRoute); 
app.use('/settings', authMiddleware, settingsRoute);
app.use('/map', authMiddleware, mapRoute);

// Setup error handling, dont display full error in production
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
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
  app.use(function (err, req, res, next) {
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
