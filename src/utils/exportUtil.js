var json2csv = require('json2csv');

var exportUtil = {
  exportTransactionList(transactions){
    var json2csv = require('json2csv');
    var fields = [
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

    var csv = json2csv({data: transactions, fields: fields});
    return csv;
  }
};

module.exports = exportUtil;