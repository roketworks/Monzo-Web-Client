'use strict';
module.exports = function(sequelize, DataTypes) {
  var Budget = sequelize.define('Budget', {
    budget_value: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Budget.belongsTo(models.User, {foreignKey: 'budget_user_id'});
        Budget.belongsTo(models.Category, {foreignKey: 'budget_cat_id'});
      }
    }
  });
  return Budget;
};