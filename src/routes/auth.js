var express = require('express');
var request = require('request-promise');
var models = require('../models/index'); 
const simpleOauthModule = require('simple-oauth2');

var router = express.Router();

// TODO: refactor into shared code with auth middleware
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
  if (req.session.mbtoken === undefined){
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  } else {
    // Refresh token the redirect to transaction
    const token = oauth2.accessToken.create(req.session.mbtoken.token);

    if (token.expired()) {
      // TODO: refactor into utility module and use in auth middleware
      token.refresh().then(function(new_token){
        const refreshed_token = oauth2.accessToken.create(new_token.token);
        models.User.find({where: {
          monzo_user_id: req.session.mbmz_usrid}
        }).then((result) => {
          result.updateAttributes({
            monzo_token: refreshed_token
          }).then((result) => {
            req.session.mbtoken = refreshed_token;
            res.redirect('/transactions');  
          });
        });
      });
    } else {
      res.redirect('/transactions');
    }
  }
});

// Callback service parsing the authorization token and asking for the access token
router.get('/redirect', (req, res, next) => {
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

    const token = oauth2.accessToken.create(result);

    // Save/update token & monzo user details
    // Todo, encrypt token storage
    models.User.find({where: {
        monzo_user_id: result.user_id
      }
    }).then(function(user){
      if (user) {
        user.updateAttributes({
          monzo_token: token
        }).then(function(user){
          req.session.mbmz_usrid = result.user_id;
          req.session.mbtoken = token;
          return res.redirect('/transactions');
        });
      } else {
        // todo: lookup accountid from monzo api
        const acc_req_options = {  
          method: 'GET',
          uri: process.env.MONZO_API_ENDPOINT + '/accounts',
          auth:{bearer: result.access_token},
          json: true 
        }; 

        request(acc_req_options).then(function(accounts){
          var account_id = accounts.accounts[0].id;

          models.User.create({
            monzo_token: token, 
            monzo_acc_id: account_id,
            monzo_user_id: result.user_id
          }).then(function(user){
            if (user){
              req.session.mbmz_usrid = result.user_id;
              req.session.mbtoken = token;
              return res.redirect('/transactions');
            } else {
              //return res.status(500).json({"message": "error occuring saving user details"});
              return next({
                status: 500,
                message: "Error occuring saving user details.",
                error: null
              });
          }
          });
        }).catch((err)=> {
          console.log(err);
          return next({
            status: 500,
            message: "Error loading account information.",
            error: null
          });
        });      
      }
    });  
  });
});

module.exports = router;