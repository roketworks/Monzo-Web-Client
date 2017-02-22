'use strict'; 

import models from '../models/index'; 

class UserService { 

  getUser(params)  {
    return this.getUser(params);  
  }
  getUserById(user_id) {
    return this.getUser({id: user_id});
  }
  getUserByMonzoUserId(monzo_user_id) {
    return this.getUser({monzo_user_id: monzo_user_id});
  }

  getUser(params) {
    return new Promise((resolve, reject) => {
      models.User.find({where: params}).then((user) => {
        resolve(user);
      }).catch((err) => { reject(err); });
    });
  }

  createUser(user_id, account_id, token){
    return new Promise((resovle, reject) => {
      models.User.create({
        monzo_user_id: user_id,
        monzo_acc_id: account_id,
        monzo_token: token, 
      }).then((user) => {
        resovle(user);
      });
    });
  }

  updateUser(attributes) {
    return new Promise((resolve, reject) => {
      const user_id = attributes[userAttributeMap.USER_ID];
      const monzo_user_id = attributes[userAttributeMap.MONZO_USER_ID];

      if (user_id === undefined && monzo_user_id === undefined) {
        reject('Unable to find user id on monzo user id');
      }

      const where = {};
      const index = user_id === undefined ? userAttributeMap.MONZO_USER_ID : userAttributeMap.USER_ID;
      const value = user_id === undefined ? monzo_user_id : user_id; 
      where[index] = value; 

      models.User.find({where: where}).then((user) => {
        if (!user){
          resolve(null);
        } else {
          delete attributes[index];
          user.updateAttributes(attributes).then((result) => {
            resolve(result);
          });
        }
      }).catch((err) => { 
        reject(err); 
      });
    });
  }
}

const userAttributeMap =  {
  MONZO_USER_ID: "monzo_user_id",
  USER_ID: "id", 
  ACCOUNT_ID: "monzo_acc_id", 
  TOKEN: "monzo_token", 
  PAYDAY: "payday_day"
};

export default UserService;
export { userAttributeMap }; 