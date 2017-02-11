var express = require('express');
var request = require('request-promise');
var models = require('../models/index');
var router = express.Router();

router.get('/', function(req, res){
  var params = {};

  res.render('transactions');
});

module.exports = router;