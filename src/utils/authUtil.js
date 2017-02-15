'use strict';

const models = require('../models/index'); 
const simpleOauthModule = require('simple-oauth2');
const Promise = require('bluebird');

const authUtil = {
  createOAuthModule: () => {
    return simpleOauthModule.create({
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
  }, 
  getAuthorizationUrl: (oauthModule) => {
    return oauthModule.authorizationCode.authorizeURL({
      redirect_uri: process.env.MONZO_OAUTH_REDIRECT_URL,
      state: process.env.MONZO_OAUTH_STATE
    });
  },
  createUserSaveToken: (user_id, account_id, token) => {
    return new Promise((resovle, reject) => {
      models.User.create({
        monzo_user_id: user_id,
        monzo_acc_id: account_id,
        monzo_token: token, 
      }).then((user) => {
        resovle();
      });
    });
  },
  updateUserToken: (user_id, token) => {
    return new Promise((resolve, reject) => {
      models.User.find({where: {monzo_user_id: user_id}})
        .then((user) => {
          if (user){
            user.updateAttributes({monzo_token: token }).then(() => {resolve(user);});
          } else {
            resolve(null);  
          }
        }).catch((err) => { reject(err); });
    });
  }, 
  setSessionData: (req, user_id, token) => {
    req.session.mbmz_usrid = user_id; 
    req.session.mbtoken = token;
  }, 
  getSessionData: (req) => {
    const data = {
      user_id: req.session.mbmz_usrid, 
      token: req.session.token
    };
    
    return data;
  }
};

module.exports = authUtil;