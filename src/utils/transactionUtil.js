'use strict';

const accounting = require('accounting');

const util = {
  getTransactionDisplayName :(name) => {
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
  }, 
  addDisplayFields: (transaction) => {
    // TODO: add support for other currencys
    transaction.categoryDisplayName = getTransactionDisplayName(transaction.category);
    transaction.displayDate = new Date(transaction.created).toLocaleString();
    transaction.displayBalance = accounting.formatMoney(transaction.account_balance/100, {symbol: '£'});
    transaction.displayAmount = accounting.formatMoney(transaction.amount/100, {symbol: '£'});
  }
}; 

module.exports = util;
