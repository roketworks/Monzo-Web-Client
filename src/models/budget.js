'use strict';
module.exports = function(sequelize, DataTypes) {
  var Budget = sequelize.define('Budget', {
    budget_value: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Budget.belongsTo(models.User);
        Budget.hasOne(models.Category)
      }
    }
  });
  return Budget;
};