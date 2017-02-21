'use strict';

import UserService from './user';
import { userAttributeMap } from './user';
import simpleOauthModule from 'simple-oauth2';

const userService = new UserService();

class AuthService { 
  createOAuthModule() {
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
  }

  getAuthorizationUrl(oauthModule) {
    return oauthModule.authorizationCode.authorizeURL({
      redirect_uri: process.env.MONZO_OAUTH_REDIRECT_URL,
      state: process.env.MONZO_OAUTH_STATE
    });
  }

  createUserSaveToken(user_id, account_id, token) {
    return userService.createUser(user_id, account_id, token);
  }

  updateUserToken(monzo_user_id, token) {
    const params = {};
    params[userAttributeMap.MONZO_USER_ID] = monzo_user_id; 
    params[userAttributeMap.TOKEN] = token;

    return userService.updateUser(params);
  }
}

export default AuthService;