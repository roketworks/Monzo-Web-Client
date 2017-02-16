'use strict';

import authUtil from '../utils/authUtil';
import sessionHelper from '../utils/sessionHelper';

const oauth2 = authUtil.createOAuthModule();

export default (req, res, next) => {
  const sessionData = sessionHelper.getSessionData(req);

  if (sessionData.token === undefined){
    return res.redirect('/');
  }

  const token = oauth2.accessToken.create(sessionData.token.token);

  if (token.expired()) {
    token.refresh().then((result) => {
      const refereshed_token = oauth2.accessToken.create(result.token);

      authUtil.updateUserToken(sessionData.user_id, refereshed_token).then((result) => {
        if (!result) {
          return next({status: 500, msg: 'Error occured', err: ''});
        }
        sessionHelper.setSessionData(req, result.monzo_user_id, refereshed_token);
        return next();
      });
    });
  } else {
    next();
  }
};