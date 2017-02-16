'use strict';

import models from '../models/index'; 
import simpleOauthModule from 'simple-oauth2';

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
  }
};

export default authUtil;