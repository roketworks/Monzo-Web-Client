'use strict';

const json2csv = require('json2csv');

const exportUtil = {
  exportTransactionList: (transactions) => {
    const fields = [
      {label: 'Created', value: 'created'}, 
      {label: 'Category', value: 'displayCategory'},
      {label: 'Description', value: 'description'},
      {label: 'Amount', value: 'displayAmount'},
      {label: 'Balance', value: 'displayBalance'},
      {label: 'Merchant', value: 'merchant.name'},
      {label: 'Address', value: 'merchant.address.formatted'},
      {label: 'Settled', value: 'settled'},
      {label: 'Notes', value: 'notes'}
    ];

    const csv = json2csv({data: transactions, fields: fields});
    return csv;
  }
};

module.exports = exportUtil;