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
        resovle();
      });
    });
  }

  updateUser(attributes) {
    return new Promise((resolve, reject) => {
      const user_id = attributes[userAttributeMap.USER_ID];
      if (user_id === undefined) {
        reject('Unable to find userid')
      }

      const where = {}
      where[userAttributeMap.USER_ID] = user_id; 

      models.User.find({where: where}).then((user) => {
        if (!user){
          resolve(null);
        } else {
          delete attributes[userAttributeMap.USER_ID];
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
  USER_ID: "monzo_user_id", 
  ACCOUNT_ID: "monzo_acc_id", 
  TOKEN: "monzo_token"
};

export default UserService;
export { userAttributeMap } 