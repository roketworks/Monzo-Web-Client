'use strict';

// Import development env vars from .env file
// NOT TO BE USED IN PRODUCTION
require('dotenv').config(); 

const express = require('express');  
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'pug');

/*mongoose.connect(process.env.DB_CONN, {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 0
    }
  }
});*/

// Register Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user'));

var port = process.env.PORT || 8081; 
app.listen(port);