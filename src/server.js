'use strict'

// Import development env vars from .env file
// NOT TO BE USED IN PRODUCTION
require('dotenv').config()

var path = require('path')
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var logger = require('morgan')
var helmet = require('helmet')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var redis = require('redis');
var RedisStore = require('connect-redis')(session);

const app = express();

// Setup View engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

var sess = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {path: '/', httpOnly: true}
}

if (app.get('env') === 'production') {
  var client = redis.createClient({url: process.env.REDIS_URL});
  sess.store = new RedisStore({client: client});
  sess.cookie.secure = true;
}

app.use(helmet())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session(sess));
app.use(express.static(path.join(__dirname, '..', 'public'))) // Setup static file hanlding for public css/js/img files

app.get('/', function (req, res) {
  res.render('index')
})

// Get Routes & Auth middleware 
var authRoute = require('./routes/auth')
var endpointRoute = require('./routes/endpoints')
var transactionRoute = require('./routes/transactions')
var mapRoute = require('./routes/map')
var authMiddleware = require('./middleware/auth')

// Register Routes
app.use('/auth', authRoute)
app.use('/endpoints', endpointRoute)
app.use('/transactions', authMiddleware, transactionRoute)
app.use('/map', authMiddleware, mapRoute)

// Setup error handling, dont display full error in production
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      status: err.status || 500,
      message: err.message,
      error: err
    })
  })
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      status: err.status || 500,
      message: err.message,
      error: null
    })
  })
}

// 404 handling
app.use(function (req, res, next) {
  res.render('error', {
    status: 404,
    message: 'Page not found',
    error: null
  })
})

var port = process.env.PORT || 8081
app.listen(port)
