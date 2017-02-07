'use strict';
require('dotenv').config(); 
const express = require('express');  
const bodyParser = require('body-parser');
//const simpleOauthModule = require('simple-oauth2');

const app = express();
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.MONZO_OAUTH_CLIENT_ID,
    secret: process.env.MONZO_OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://api.getmondo.co.uk',
    tokenPath: '/oauth2/token',
    authorizeHost: 'https://auth.getmondo.co.uk',
    authorizePath: '/'
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:8081/redirect',
  state: '3453454567'
});

// Initial page redirecting to Monzo
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/redirect', (req, res) => {
  const code = req.query.code;
  const options = {
    code: code,
    redirect_uri: 'http://localhost:8081/redirect'
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    return res
      .status(200)
      .json(token);
  });
});*/

// Register routes
//app.use('/user', require('routes/user'));
app.use('/auth', require('./routes/auth'))

var port = process.env.PORT || 8081; 
app.listen(port);