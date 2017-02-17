'use strict'; 

import models from '../models/index'; 
import MonzoService from '../m'

class BudgetService { 

  getBudgetsForUser(user_id) {
    return new Promise((resolve, reject) => {
      models.Budget.find({
        include: [
          {model: User}, 
          {where: { user_id: Sequelize }}]
      })
    });
  }
}