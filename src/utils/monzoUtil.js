'use strict'; 

const Promse = require('bluebird');
const Monzo = require('monzo-api');

// Not using 
const api = new Monzo();

const monzoUtil = {
  getAccountId: (access_token) => {
    return new Promise((resolve, reject) => {
      api.accounts(access_token).then((result) => {
        resolve(result.accounts[0].id);
      }).catch((err) => { 
        reject(err); 
      });
    });
  }
};

module.exports = monzoUtil;