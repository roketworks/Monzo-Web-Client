'use strict'; 

import accounting from 'accounting';
import moment from'moment';
import Monzo from '../services/monzoApi';
import userUtil from '../utils/userUtil';
import transactionUtil from '../utils/transactionUtil';

// Not using auth parameters as we manage this ourselves. 
const api = new Monzo();

const monzoUtil = {
  getAccountIdApi: (access_token) => {
    return new Promise((resolve, reject) => {
      api.accounts(access_token).then((result) => {
        resolve(result.accounts[0].id);
      }).catch((err) => { 
        reject(err); 
      });
    });
  }, 
  getAccountIdDb: (user_id) => {
    return new Promise((resolve, reject) => {
      userUtil.getUserByMonzoUserId(user_id).then((user) => {
        resolve(user.monzo_acc_id);
      }).catch((err) => {
         reject (err); 
      });
    });
  }, 
  getBalance: (account_id, access_token) => {
    return new Promise((resolve, reject) => {
      api.balance(account_id, access_token).then((result) => {
        const balance = {
          balance: result.balance, 
          spend_today: result.spend_today,
          formattedBalance: accounting.formatMoney(result.balance/100, {symbol: '£'}),
          formattedSpend: accounting.formatMoney(Math.abs(result.spend_today)/100, {symbol: '£'})
        }
        resolve(balance);
      }).catch((err) => {
        reject(err);
      });
    });
  }, 
  getTransactions: (account_id, expand, paging, access_token) => {
    // TODO: Possibly rethink pagination
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
      since = moment(since).toISOString();
    }

    const pagination = { 
      before: before, 
      since: since
    };

    if (paging.limit !== undefined) {
      pagination.limit = paging.limit;
    }

    return new Promise((resolve, reject) => {
      api.transactions(account_id, expand, pagination, access_token).then((result) => { 
        const transactions = result.transactions;
        transactions.forEach((transaction) => {
          transactionUtil.addDisplayFields(transaction, false);
        });
        transactions.reverse();
        resolve(transactions); 
      }).catch((err) => {
        reject(err);
      });
    });
  }, 
  getTransaction: (transaction_id, access_token) => { 
    return new Promise((resolve, reject) => {
      api.transaction(transaction_id, true, access_token).then((result) => {
        const transaction = result.transaction;
        transactionUtil.addDisplayFields(transaction, true);
        resolve(transaction);  
      }).catch((err) => {
        reject(err);
      });
    });  
  }
};

export default monzoUtil;