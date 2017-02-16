'use strict';

import accounting from 'accounting';

const util = {
  getTransactionDisplayName: (name) => {
    return getTransactionDisplayName(name);
  },
  addDisplayFields: (transaction, abs) => {
    // TODO: add support for other currencys
    transaction.categoryDisplayName = getTransactionDisplayName(transaction.category);
    transaction.displayDate = new Date(transaction.created).toLocaleString();
    transaction.displayBalance = formatMoney(transaction.account_balance);
    transaction.displayAmount = formatMoney(transaction.amount, abs);
  }
}; 

const formatMoney = (amount, abs = false, symbol = '£') => {
  if (abs) {
    return accounting.formatMoney(Math.abs(amount)/100, {symbol: symbol});
  }

  return accounting.formatMoney(amount/100, {symbol: symbol});
};

const getTransactionDisplayName = (name) => {
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
};  

export default util;
