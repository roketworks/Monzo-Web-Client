'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    monzo_token: DataTypes.JSON
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Budget);
      }
    }
  });
  return User;
};