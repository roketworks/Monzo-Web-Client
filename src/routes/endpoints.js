var express = require('express');
var router = express.Router();
var models = require('../models/index');

router.post('/webhook', function(req, res){
  // When webhook is sent from monzo
  console.log(req);
});

module.exports = router;