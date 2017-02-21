'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Budgets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      budget_cat_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: 'Categories', key: 'id'}
      },
      budget_user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: 'Users', key: 'id'}
      },
      budget_value: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Budgets');
  }
};