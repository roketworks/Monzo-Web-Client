'use strict';

import express from 'express';
import Monzo from '../services/monzo'; 
import exportUtils from '../utils/exportUtil';
import sessionUtil from '../utils/sessionHelper';

const router = express.Router();
const monzoService = new Monzo();

router.get('/', function(req, res, next) {
  const sessionData = sessionUtil.getSessionData(req);
  monzoService.accessToken = sessionData.token.token.access_token;
  
  // / TODO: Reduce nesting by returning the nested promises in a chain rather than nesting
  monzoService.getAccountIdDb(sessionData.user_id).then((account_id) => {
    monzoService.getBalance(account_id).then((balance) => {
     monzoService.getTransactions(account_id, true, {}).then((transactions) => {
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
  monzoService.accessToken = sessionData.token.token.access_token;
  
  monzoService.getAccountIdDb(sessionData.user_id).then((account_id) => {
    monzoService.getTransactions(account_id, true, {}).then((transactions) => {
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
  monzoService.accessToken = sessionData.token.token.access_token;

  monzoService.getAccountIdDb(sessionData.user_id).then((account_id) => {
    monzoService.getTransactions(account_id, true, {}).then((transactions) => {
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
  monzoService.accessToken = sessionData.token.token.access_token;  

  monzoService.getTransaction(req.params.trans_id)
    .then((transaction) => {
      return res.render('transaction', {"transaction": transaction});  
    }).catch((err) => {
      next(err);
    });
});

export default router;