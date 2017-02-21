'use strict';

const createdAt = new Date();

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Categories', [
      {cat_id: 'general', cat_name: 'General', cat_icon_class: 'glyphicon glyphicon-file', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'eating_out', cat_name: 'Eating Out', cat_icon_class: 'glyphicon glyphicon-cutlery', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'expenses', cat_name: 'Expenses', cat_icon_class: 'glyphicon glyphicon-briefcase', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'transport', cat_name: 'Transport', cat_icon_class: 'glyphicon glyphicon-plane', createdAt: createdAt, updatedAt:createdAt},
      {cat_id: 'cash', cat_name: 'Cash', cat_icon_class: 'glyphicon glyphicon-gbp', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'bills', cat_name: 'Bills', cat_icon_class: 'glyphicon glyphicon-credit-card', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'entertainment', cat_name: 'Entertainment', cat_icon_class: 'glyphicon glyphicon-glass', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'shopping', cat_name: 'Shopping', cat_icon_class: 'glyphicon glyphicon-shopping-cart', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'holidays', cat_name: 'Holidays', cat_icon_class: 'glyphicon glyphicon-sunglasses', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'groceries', cat_name: 'Groceries', cat_icon_class: 'glyphicon glyphicon-apple', createdAt: createdAt, updatedAt:createdAt}
    ], {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};
