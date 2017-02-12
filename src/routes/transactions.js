var express = require('express');
var request = require('request-promise');
var accounting = require('accounting');
var models = require('../models/index');
var router = express.Router();

router.get('/', function(req, res, next){
  // Load account id
  // Using cookies for user id information here, dont really care about it not being restful
  models.User.find({
    where: {monzo_user_id: req.cookies.mbmz_usrid }
  }).then(function(user){
    var limit = 25;
    if (!(req.query.num === undefined)){
      limit = req.query.num;
    }

    const options = {  
      method: 'GET',
      uri: process.env.MONZO_API_ENDPOINT + '/transactions',
      auth:{bearer: user.monzo_token.token.access_token},
      qs: {
        "expand[]": "merchant", 
        "account_id": user.monzo_acc_id, 
        "limit": limit
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
        });

        const balanceOptions = {
          method: 'GET', 
          uri: process.env.MONZO_API_ENDPOINT + '/balance', 
          auth: {bearer: user.monzo_token.token.access_token}, 
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

router.get('/:trans_id', function(req, res, next){
  const options = {
    method: 'GET',
    uri: process.env.MONZO_API_ENDPOINT + '/transactions/' + req.params.trans_id,
    auth:{bearer: req.cookies.mbtoken.access_token},
    qs: { "expand[]": "merchant" },
    qsStringifyOptions: { encode: false },
    json: true    
  };

  request(options)
    .then(function(transaction){
      return res.render('transaction', {"transaction": transaction.transaction});  
    })
    .catch(function(err){
      return next({error: {status: 500, message: err.message, error: err}});
    });
});

/*function getTransactions(token, acc_id, limit){
  const options = {  
      method: 'GET',
      uri: process.env.MONZO_API_ENDPOINT + '/transactions',
      auth:{bearer: token},
      qs: {
        "expand[]": "merchant", 
        "account_id": acc_id, 
        "limit": limit
      },
      qsStringifyOptions: { encode: false },
      json: true    
    }; 

    return(request)
}*/

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