var models = require('../models/index');

var userRepo = {
  find: function(where, callback){
    models.User.find({where: where}).then(function(result){
      callback(result);
    });
  },
  findByUserId: function(userid, callback){
    models.User.find({where: {id: userid}}).then(function(result){
      callback(result);
    });
  }, 
  testCreate: function(user, callback){
    models.User.create({
      monzo_token: {token: "data"}
    }).then(function(created){
      callback(created);
    });
  }
};

module.exports = userRepo;