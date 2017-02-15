'use strict';

const simpleOauthModule = require('simple-oauth2');
var models = require('../models/index');

// TODO :refactor into shared code with auth route
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

// TODO: possible implement bearer token to fallback onto cookies for rest
module.exports = function(req, res, next){
  console.log('session: ' + req.session);
  var tokenObject = req.session.mbtoken;
  var monzo_userid = req.session.mbmz_usrid;

  if (tokenObject === undefined){
    return res.redirect('/');
  }

  const token = oauth2.accessToken.create(tokenObject.token);

  if (token.expired()) {
    token.refresh().then((result) => {
      const refereshed_token = oauth2.accessToken.create(result.token);
      models.User.find({where: {
        monzo_user_id: monzo_userid}
      }).then((result) => {
        result.updateAttributes({
          monzo_token: refereshed_token
        }).then((result) => {
          req.session.mbtoken = refereshed_token;
          next();
        });
      });
    });
  } else {
    next();
  }
};