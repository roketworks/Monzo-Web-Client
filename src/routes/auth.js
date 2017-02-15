'use strict';

const express = require('express');
const Promise = require('bluebird');
const request = require('request-promise');
const authUtil = require('../utils/authUtil');
const monzoUtil = require('../utils/monzoUtil');

const router = express.Router();

// TODO: refactor into shared code with auth middleware
const oauth2 = authUtil.createOAuthModule();
const authorizationUri = authUtil.getAuthorizationUrl(oauth2);

// Initial page redirecting to Monzo
router.get('/', (req, res) => {
  const sessionData = authUtil.getSessionData(req);
  if (sessionData.token === undefined){
    console.log(authorizationUri);
    return res.redirect(authorizationUri);
  } 
  // Refresh token the redirect to transaction
  const token = oauth2.accessToken.create(req.session.mbtoken.token);

  if (token.expired()) {
    // TODO: refactor into utility module and use in auth middleware
    token.refresh().then((new_token) => {
      const refreshed_token = oauth2.accessToken.create(new_token.token);
      authUtil.updateUserToken(req.session.mbmz_usrid, refreshed_token).then((result) => {
        req.session.mbtoken = refreshed_token;
        return res.redirect('/transactions');  
      });
    });
  } 

  res.redirect('/transactions');
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
      return next({status: 401, message: "Monzo Authenication failed", error: error});
    }

    const token = oauth2.accessToken.create(result);
    const user_id = result.user_id;

    // Save/update token & monzo user details
    // Todo, encrypt token storage
    authUtil.updateUserToken(user_id, token).then((result) => {
      // User exists and has been updated
      if (result) {
        authUtil.setSessionData(req, user_id, token);
        return res.redirect('/transactions'); 
      }
      
      // result is null user did not exist 
      // need to lookup account id and save user token
      createUser(user_id, token).then(() => {
        authUtil.setSessionData(req, user_id, token);
        return res.redirect('/transactions');
      }).catch((err) => {
        // TODO: check error hanlding
        return next(err);
      });
    });

    /*models.User.find({where: {
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
          const account_id = accounts.accounts[0].id;

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
    }); */ 
  });
});

const createUser = (user_id, token) => {
  return new Promise((resolve, reject) => {
    monzoUtil.getAccountId(token.token.access_token).then((acc_id) => {
      authUtil.createUserSaveToken(user_id, acc_id, token).then(() => {
        resolve();
      });  
    }).catch((err) => { reject(err); });
  });
}

module.exports = router;