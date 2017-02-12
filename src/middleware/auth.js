const simpleOauthModule = require('simple-oauth2');
var models = require('../models/index');

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
  var tokenObject = req.cookies.mbtoken;
  var monzo_userid = req.cookies.mbmz_usrid;

  if (tokenObject === undefined){
    return res.redirect('/');
  }

  const token = oauth2.accessToken.create(tokenObject);

  if (token.expired()) {
    token.refresh().then((result) => {
      token = result;
      models.User.find({where: {
        monzo_user_id: monzo_userid}
      }).then((result) => {
        result.updateAttributes({
          monzo_token: token
        }).then((result) => {
          res.cookie('mbtoken', token);
          next();
        });
      });
    });
  } else {
    next();
  }
};