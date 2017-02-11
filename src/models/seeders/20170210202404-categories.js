'use strict';

const createdAt = new Date();

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Categories', [
      {cat_id: 'general', cat_name: 'General', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'eating_out', cat_name: 'Eating Out', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'expenses', cat_name: 'Expenses', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'transport', cat_name: 'Transport', createdAt: createdAt, updatedAt:createdAt},
      {cat_id: 'cash', cat_name: 'Cash', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'bills', cat_name: 'Bills', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'entertainment', cat_name: 'Entertainment', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'shopping', cat_name: 'Shopping', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'holidays', cat_name: 'Holidays', createdAt: createdAt, updatedAt:createdAt}, 
      {cat_id: 'groceries', cat_name: 'Groceries', createdAt: createdAt, updatedAt:createdAt}
    ], {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};
