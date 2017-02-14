var fs = require('fs');
var express = require('express');
var querystring = require('querystring');
var request = require('request-promise');
var accounting = require('accounting');
var moment = require('moment');
var exportUtils = require('../utils/exportUtil');

var models = require('../models/index');
var router = express.Router();

router.get('/', function(req, res, next){
  return res.render('map');
});

// TODO include in api refactor 
// Code can be shared with transaction route because thats where I copied most of it from... 
router.get('/json', function(req, res, next){
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

        return res.json(transactions.transactions.filter(function(value){ return value.is_load === false})); 
      })
      .catch(function(err){
        return next({error: {status: 500, message: err.message, error: err}});
      });
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