'use strict';

const sessionUtil = { 
  setSessionData: (req, user_id, token) => {
    req.session.mbmz_usrid = user_id; 
    req.session.mbtoken = token;
  }, 
  getSessionData: (req) => {
    const data = {
      user_id: req.session.mbmz_usrid, 
      token: req.session.mbtoken
    };
    return data;
  }
};

export default sessionUtil;
