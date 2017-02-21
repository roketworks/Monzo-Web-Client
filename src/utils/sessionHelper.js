'use strict';

const sessionUtil = { 
  setSessionData: (req, user_id, monzo_user_id, token) => {
    req.session.user_id = user_id;
    req.session.mbmz_usrid = monzo_user_id; 
    req.session.mbtoken = token;
  }, 
  getSessionData: (req) => {
    const data = {
      user_id: req.session.user_id,
      monzo_user_id: req.session.mbmz_usrid, 
      token: req.session.mbtoken
    };
    return data;
  }
};

export default sessionUtil;
