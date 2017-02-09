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

// Register Routes
// Both of these below routes need to be public and not use authentication
app.use('/auth', require('./routes/auth'));
app.use('/endpoints', require('./routes/endpoints')); 

// Below routes need protected
app.use('/users', require('./routes/user'));

var port = process.env.PORT || 8081; 
app.listen(port);