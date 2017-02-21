'use strict';
module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define('Category', {
    cat_id: DataTypes.STRING, 
    cat_name: DataTypes.STRING, 
    cat_icon_class: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Category.hasMany(models.Budget, {foreignKey: 'budget_cat_id'});
      }
    }
  });
  return Category;
};