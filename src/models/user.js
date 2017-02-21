'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    monzo_user_id: DataTypes.STRING,
    monzo_acc_id: DataTypes.STRING,
    monzo_token: DataTypes.JSON, 
    payday_day: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Budget, {foreignKey: 'budget_user_id'});
      }
    }
  });
  return User;
};