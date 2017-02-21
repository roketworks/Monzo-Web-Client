'use strict';

import express from 'express';
import Auth from '../services/auth';
import Monzo from '../services/monzo';
import sessionHelper from '../utils/sessionHelper';

const router = express.Router();
const authService = new Auth();

// TODO: refactor into shared code with auth middleware
const oauth2 = authService.createOAuthModule();
const authorizationUri = authService.getAuthorizationUrl(oauth2);

// Initial page redirecting to Monzo
router.get('/', (req, res) => {
  const sessionData = sessionHelper.getSessionData(req);
  if (sessionData.token === undefined){
    console.log(authorizationUri);
    return res.redirect(authorizationUri);
  } 
  // Refresh token the redirect to transaction
  const token = oauth2.accessToken.create(sessionData.token.token);

  if (token.expired()) {
    token.refresh().then((new_token) => {
      const refreshed_token = oauth2.accessToken.create(new_token.token);
      authService.updateUserToken(sessionData.monzo_user_id, refreshed_token).then((user) => {
        sessionHelper.setSessionData(req, user.id, sessionData.monzo_user_id, refreshed_token);
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
      return next({status: 401, message: 'Monzo Authenication failed', error: error});
    }

    const token = oauth2.accessToken.create(result);
    const monzo_user_id = result.user_id;

    // Save/update token & monzo user details
    authService.updateUserToken(monzo_user_id, token).then((result) => {
      // User exists and has been updated
      if (result) {
        sessionHelper.setSessionData(req, result.id, monzo_user_id, token);
        return res.redirect('/transactions'); 
      }
      
      // result is null user did not exist 
      // need to lookup account id and save user token
      createUser(monzo_user_id, token).then((result) => {
        sessionHelper.setSessionData(req, result.id, monzo_user_id, token);
        return res.redirect('/transactions');
      }).catch((err) => {
        return next(err);
      });
    });
  });
});

const createUser = (user_id, token) => {
  return new Promise((resolve, reject) => {
    const service = new Monzo(token.token.access_token);
    service.getAccountIdApi().then((acc_id) => {
      authService.createUserSaveToken(user_id, acc_id, token).then((result) => {
        resolve(result);
      });  
    }).catch((err) => { reject(err); });
  });
};

export default router;