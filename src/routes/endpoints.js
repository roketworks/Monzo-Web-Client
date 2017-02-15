'use strict';

const express = require('express');
const router = express.Router();
const models = require('../models/index');

router.post('/webhook', function(req, res){
  // When webhook is sent from monzo
  console.log(req);
});

module.exports = router;