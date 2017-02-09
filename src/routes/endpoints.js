var express = require('express');
var router = express.Router();
var models = require('../models/index');

router.post('/monzo', function(req, res){
  // When webhook is sent from monzo
  console.log(req);
  if (req.type == "transaction.created") {
    models.User.create({
      monzo_token: {token: req.data.id}
    }).then(function(created){
      res.status(200).send({});
    });
  }   
});

module.exports = router;