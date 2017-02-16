'use strict';

import express from 'express';
import Promise from 'bluebird';
import exportUtils from '../utils/exportUtil';
import monzoUtil from '../utils/monzoUtil'; 
import userUtil from '../utils/userUtil'; 
import sessionUtil from '../utils/sessionHelper';

const router = express.Router();

router.get('/', function(req, res, next) {
  const sessionData = sessionUtil.getSessionData(req);

  // / TODO: Reduce nesting by returning the nested promises in a chain rather than nesting
  monzoUtil.getAccountIdDb(sessionData.user_id).then((account_id) => {
    monzoUtil.getBalance(account_id, sessionData.token.token.access_token).then((balance) => {
     monzoUtil.getTransactions(account_id, true, {}, sessionData.token.token.access_token).then((transactions) => {
        return res.render('transactions', {
          "balance": balance.formattedBalance,
          "spend_today": balance.formattedSpend,
          "transactions": transactions
        });
      }).catch((err) => {
        return next(err);
      });
    }).catch((err) => {
      return next(err);
    });
  });
});

// This is pure dirt, but was quicker than rewriting jade template to be rendered in pure html via jquery
router.get('/loadmore', function(req, res, next){
  const sessionData = sessionUtil.getSessionData(req);

  monzoUtil.getAccountIdDb(sessionData.user_id).then((account_id) => {
    monzoUtil.getTransactions(account_id, true, {}, sessionData.token.token.access_token).then((transactions) => {
      res.render('transactionrows',{"transactions": transactions}, function(err, html){
        if (err) return next(err);
        res.send(html);
      });  
    }).catch((err) => {
      return next(err);
    });
  });
});

router.get('/export', function(req, res, next) {
  const sessionData = sessionUtil.getSessionData(req);

  monzoUtil.getAccountIdDb(sessionData.user_id).then((account_id) => {
    monzoUtil.getTransactions(account_id, true, {}, sessionData.token.token.access_token).then((transactions) => {
      res.setHeader('Content-disposition', 'attachment; filename=transactions.csv');
      res.setHeader('Content-type', 'text/csv');
      res.write(exportUtils.exportTransactionList(transactions));
      res.end();
    });
  }).catch((err) => {
    return next(err);
  });
});

router.get('/:trans_id', function(req, res, next) {
  const sessionData = sessionUtil.getSessionData(req);
  monzoUtil.getTransaction(req.params.trans_id, sessionData.token.token.access_token)
    .then((transaction) => {
      return res.render('transaction', {"transaction": transaction});  
    }).catch((err) => {
      next(err);
    });
});

export default router;