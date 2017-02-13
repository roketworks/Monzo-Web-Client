var fs = require('fs');
var express = require('express');
var querystring = require('querystring');
var request = require('request-promise');
var accounting = require('accounting');
var moment = require('moment');
var exportUtils = require('../utils/exportUtil');

var models = require('../models/index');
var router = express.Router();

// TODO: refactor monzo api calls into module/utility

router.get('/', function(req, res, next){
  // Load account id
  // Using cookies for user id information here, dont really care about it not being restful
  models.User.find({
    where: {monzo_user_id: req.cookies.mbmz_usrid }
  }).then(function(user){
    var before_param, since_param;

    if (req.query.before === undefined) {
      before_param = moment().toISOString(); 
    } else {
      before_param = moment(req.query.before).toISOString();
    }

    if (req.query.since  === undefined) {
      since_param = moment(req.query.before).subtract(7, 'days').toISOString();
    } else {
      since_param = moment(req.query.since).toISOString();
    }

    const access_token = user.monzo_token.token.access_token;
    const options = {  
      method: 'GET',
      uri: process.env.MONZO_API_ENDPOINT + '/transactions',
      auth:{bearer: access_token},
      qs: {
        "expand[]": "merchant", 
        "account_id": user.monzo_acc_id, 
        "before": before_param, 
        "since": since_param
      },
      qsStringifyOptions: { encode: false },
      json: true    
    }; 

    // TODO: MAKE WEB REQUESTS PARALLEL, not important atm
    // TODO: format transactions into object
    request(options)
      .then(function(transactions){
        transactions.transactions.forEach(function(transaction) {
          transaction.categoryDisplayName = getTransactionDisplayName(transaction.category);
          transaction.displayDate = new Date(transaction.created).toLocaleString();
          transaction.displayBalance = accounting.formatMoney(transaction.account_balance/100, {symbol: '£'});
          transaction.displayAmount = accounting.formatMoney(transaction.amount/100, {symbol: '£'});
        });

        transactions.transactions.reverse();

        const balanceOptions = {
          method: 'GET', 
          uri: process.env.MONZO_API_ENDPOINT + '/balance', 
          auth: {bearer: access_token}, 
          qs: {account_id: user.monzo_acc_id}, 
          json: true
        };
        request(balanceOptions)
          .then(function(balance){
            // Todo: support other current/symbols
            var formattedBalance = accounting.formatMoney(balance.balance/100, {symbol: '£'});
            var formattedSpend= accounting.formatMoney(balance.spend_today/100, {symbol: '£'});
            return res.render('transactions', {
              "balance": formattedBalance,
              "spend_today": balance.spend_today,
              "older_query": querystring.stringify({before: transactions.transactions[transactions.transactions.length-1].created}),
              "transactions": transactions.transactions
            });
          })
          .catch(function(err){
            return next({error: {status: 500, message: err.message, error: err}});
          });

      })
      .catch(function(err){
        return next({error: {status: 500, message: err.message, error: err}});
      });
  });
});

// This is pure dirt, but was quicker than rewriting jade template to be rendered in pure html via jquery
router.get('/loadmore', function(req, res, next){
  var before_param, since_param;

  if (req.query.before === undefined) {
    before_param = moment().toISOString(); 
  } else {
    before_param = moment(req.query.before).toISOString();
  }

  if (req.query.since_param  === undefined) {
    since_param = moment(req.query.before).subtract(7, 'days').toISOString();
  } else {
    since_param = moment(req.query.since).toISOString();
  } 

  models.User.find({
    where: {monzo_user_id: req.cookies.mbmz_usrid }
  }).then(function(user){
    const access_token = user.monzo_token.token.access_token;
    const options = {  
      method: 'GET',
      uri: process.env.MONZO_API_ENDPOINT + '/transactions',
      auth:{bearer: access_token},
      qs: {
        "expand[]": "merchant", 
        "account_id": user.monzo_acc_id, 
        "before": before_param, 
        "since": since_param
      },
      qsStringifyOptions: { encode: false },
      json: true    
    }; 

    request(options)
      .then(function(transactions){
        // TODO: possibly check number of transactions and call again if less than certain threshold
        transactions.transactions.forEach(function(transaction) {
          // TODO: refactor this into helper function
          transaction.categoryDisplayName = getTransactionDisplayName(transaction.category);
          transaction.displayDate = new Date(transaction.created).toLocaleString();
          transaction.displayBalance = accounting.formatMoney(transaction.account_balance/100, {symbol: '£'});
          transaction.displayAmount = accounting.formatMoney(transaction.amount/100, {symbol: '£'});
        });

        transactions.transactions.reverse();
        res.render('transactionrows',{"transactions": transactions.transactions}, function(err, html){
          if (err) return next(err);
          res.send(html);
        });
      });
  });
});

router.get('/export', function(req, res, next){
  var before_param, since_param;

  if (req.query.before === undefined) {
    before_param = moment().toISOString(); 
  } else {
    before_param = moment(req.query.before).toISOString();
  }

  if (req.query.since  === undefined) {
    since_param = moment(req.query.before).subtract(7, 'days').toISOString();
  } else {
    since_param = moment(req.query.since).toISOString();
  } 

  models.User.find({
    where: {monzo_user_id: req.cookies.mbmz_usrid }
  }).then(function(user){
    const access_token = user.monzo_token.token.access_token;
    const options = {  
      method: 'GET',
      uri: process.env.MONZO_API_ENDPOINT + '/transactions',
      auth:{bearer: access_token},
      qs: {
        "expand[]": "merchant", 
        "account_id": user.monzo_acc_id, 
        "before": before_param, 
        "since": since_param
      },
      qsStringifyOptions: { encode: false },
      json: true    
    }; 

    request(options)
      .then(function(transactions){
        // TODO: possibly check number of transactions and call again if less than certain threshold
        transactions.transactions.forEach(function(transaction) {
          // TODO: refactor this into helper function
          transaction.categoryDisplayName = getTransactionDisplayName(transaction.category);
          transaction.displayDate = new Date(transaction.created).toLocaleString();
          transaction.displayBalance = accounting.formatMoney(transaction.account_balance/100, {symbol: '£'});
          transaction.displayAmount = accounting.formatMoney(transaction.amount/100, {symbol: '£'});
        });

        transactions.transactions.reverse();
        
        res.setHeader('Content-disposition', 'attachment; filename=transactions.csv');
        res.setHeader('Content-type', 'text/csv');
        res.write(exportUtils.exportTransactionList(transactions.transactions));
        res.end();
      });
  });  
});

router.get('/:trans_id', function(req, res, next){
  const options = {
    method: 'GET',
    uri: process.env.MONZO_API_ENDPOINT + '/transactions/' + req.params.trans_id,
    auth:{bearer: req.cookies.mbtoken.token.access_token},
    qs: { "expand[]": "merchant" },
    qsStringifyOptions: { encode: false },
    json: true    
  };

  request(options)
    .then(function(transaction_reponse) {
      var transaction = transaction_reponse.transaction;
      transaction.displayCategory = getTransactionDisplayName(transaction.category);
      transaction.displayDate = new Date(transaction.created).toLocaleString(); 
      transaction.displayBalance = accounting.formatMoney(transaction.account_balance/100, {symbol: '£'});
      transaction.displayAmount = accounting.formatMoney(Math.abs(transaction.amount/100), {symbol: '£'});
      return res.render('transaction', {"transaction": transaction});  
    })
    .catch(function(err){
      return next({error: {status: 500, message: err.message, error: err}});
    });
});

function getTransactionDisplayName(name){
  switch(name){
    case "monzo":
    case "mondo":
      return "Monzo";
     case "general":
      return "General";
     case "eating_out":
      return "Eating Out";
     case "expenses":
      return "Expenses";
     case "transport":
      return "Transport";
     case "cash":
      return "Cash";
     case "bills":
      return "Bills";
     case "entertainment":
      return "Entertainment";
     case "shopping":
      return "Shopping";
     case "holidays":
      return "Holidays";
     case "groceries":
      return "Groceries";
  }
}

module.exports = router;