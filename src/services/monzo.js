'use strict'; 

import accounting from 'accounting';
import moment from'moment';
import MonzoApi from 'monzo-api';
import UserService from './user';
import transactionUtil from '../utils/transactionUtil';

const api = new MonzoApi();
const userService = new UserService();

class Monzo {

  set accessToken(value){
    this._accessToken = value;
  }

  constructor(token) {
    this._accessToken = token;
  }

  getAccountIdApi() {
    return new Promise((resolve, reject) => {
      api.accounts(this._accessToken).then((result) => {
        resolve(result.accounts[0].id);
      }).catch((err) => { 
        reject(err); 
      });
    });
  }

  getAccountIdDb(user_id) {
    return new Promise((resolve, reject) => {
      userService.getUserByMonzoUserId(user_id).then((user) => {
        resolve(user.monzo_acc_id);
      }).catch((err) => {
         reject (err); 
      });
    });
  }

  getBalance(account_id) {
    return new Promise((resolve, reject) => {
      api.balance(account_id, this._accessToken).then((result) => {
        const balance = {
          balance: result.balance, 
          spend_today: result.spend_today,
          formattedBalance: accounting.formatMoney(result.balance/100, {symbol: '£'}),
          formattedSpend: accounting.formatMoney(Math.abs(result.spend_today)/100, {symbol: '£'})
        };
        resolve(balance);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getTransaction(transaction_id) { 
    return new Promise((resolve, reject) => {
      api.transaction(transaction_id, true, this._accessToken).then((result) => {
        const transaction = result.transaction;
        transactionUtil.addDisplayFields(transaction, true);
        resolve(transaction);  
      }).catch((err) => {
        reject(err);
      });
    });  
  }

  getTransactions(account_id, expand, paging, all_transactions) {
    if (paging.limit === undefined) {
      paging.limit = 100;
    }

    if (all_transactions === undefined) {
      all_transactions = [];
    }

    let deferred = Promise.defer();

    this.internalGetTransactions(account_id, expand, paging).then((result) => {
      Array.prototype.push.apply(all_transactions, result);

      if (result.length === paging.limit) {
        const new_paging = {};
        new_paging.limit = paging.limit; 
        new_paging.before = paging.before; 
        new_paging.since = result[0].id; 
        
        this.getTransactions(account_id, expand, new_paging, all_transactions).then((res) => {
          deferred.resolve(res);
        });
      } else {
        deferred.resolve(all_transactions.reverse());
      }  
    });

    return deferred.promise;
  }

  internalGetTransactions(account_id, expand, paging) {
    let before = paging.before; 
    let since = paging.since; 

    if (before === undefined) {
      before = moment().toISOString(); 
    } else {
      before = moment(before).toISOString();
    }

    if (since  === undefined) {
      since = moment(before).subtract(7, 'days').toISOString();
    } else {
      const isDate = moment(since, moment.ISO_8601, true).isValid();
      since = isDate ? moment(since).toISOString() : since;
    }

    const pagination = { 
      before: before, 
      since: since
    };

    if (paging.limit !== undefined) {
      pagination.limit = paging.limit;
    }

    return new Promise((resolve, reject) => {
      api.transactions(account_id, expand, pagination, this._accessToken).then((result) => { 
        const transactions = result.transactions;
        transactions.forEach((transaction) => {
          transactionUtil.addDisplayFields(transaction, false);
        });
        return resolve(transactions); 
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

export default Monzo;