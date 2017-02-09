var express = require('express');
var router = express.Router();
var userRepo = require('../repos/users');

router.route('/')
  .get(function(req, res){

  })
  .post(function(req, res){
    userRepo.create(null, function(saved, err){
      if (err){
        res.json(err);
      } else{
        res.json(saved);
      }
    });  
  });

router.route('/:userid')
  .get(function(req, res){
    userRepo.testCreate(null, function(saved){
      res.json(saved);
    });
  });

module.exports = router;