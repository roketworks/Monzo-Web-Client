var express = require('express');
var router = express.Router();
const simpleOauthModule = require('simple-oauth2');

const oauth2 = simpleOauthModule.create({
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
  redirect_uri: process.env.MONZO_OAUTH_REDIRECT_URL,
  state: process.env.MONZO_OAUTH_STATE
});

// Initial page redirecting to Monzo
router.get('/', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
router.get('/redirect', (req, res) => {
  const code = req.query.code;
  const options = {
    code: code,
    redirect_uri: process.env.MONZO_OAUTH_REDIRECT_URL
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
});

module.exports = router;