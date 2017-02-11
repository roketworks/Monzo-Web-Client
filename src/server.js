'use strict';

// Import development env vars from .env file
// NOT TO BE USED IN PRODUCTION
require('dotenv').config(); 

var path = require('path');
var express = require('express');  
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var authMiddleware = require('./middleware/auth');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SECRET));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Error handling
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        status: err.status || 500,
        message: err.message,
        error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        status: err.status || 500,
        message: err.message,
        error: null
    });
});


//test view
app.get('/', function(req, res){
    res.render('index');
});

// Register Routes
// Both of these below routes need to be public and not use authentication
app.use('/auth', require('./routes/auth'));
app.use('/endpoints', require('./routes/endpoints')); 

//Register auth middleware, only used for below routes
app.use([authMiddleware]);

//secured routes
app.use('/transactions', require('./routes/transactions'));

//404 handling
app.use(function (req, res, next) {
    res.render('error', {
        status: 404,
        message: "Page not found", 
        error: null
    });
});

var port = process.env.PORT || 8081; 
app.listen(port);