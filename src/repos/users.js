var models = require('../models/index');

var userRepo = {
  /*findByUserId: function(id, callback){
    User.findById(id, function(err, res){
      if (err) {
        callback(null, err);
      } else {
        callback(res, null);
      }
    }); 
  }, 
  create: function(obj, callback){
    var userSch = new User();
    userSch.user_id = "12313123";
    userSch.monzo_token = "123124323111412";

    User.create(userSch, function(err, saved){
      if (err){
        callback(null, err);
      } else {
        callback(user);
      }
    });
  }*/
  find: function(where, callback){

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