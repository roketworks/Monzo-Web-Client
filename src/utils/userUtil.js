'use strict'; 

import models from '../models/index'; 

const userUtil = {
  getUser: (params) => {
    return getUser(params);  
  }, 
  getUserById: (user_id) => {
    return getUser({id: user_id});
  }, 
  getUserByMonzoUserId: (monzo_user_id) => {
    return getUser({monzo_user_id: monzo_user_id});
  }
};

const getUser = (params) => {
  return new Promise((resolve, reject) => {
      models.User.find({where: params}).then((user) => {
        resolve(user);
      }).catch((err) => { reject(err); });
    });
};

export default userUtil;