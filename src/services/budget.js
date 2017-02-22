'use strict'; 

import models from '../models/index'; 
import Monzo from './monzo';
import moment from 'moment';

const monzo = new Monzo();

class BudgetService { 

  getBudgetsForUser(user_id, access_token) {
    return new Promise((resolve, reject) => {
      models.User.find({
        where: {id: user_id}, 
        include: [
          {model: models.Budget, include: [
            {model: models.Category}
          ]
        }]
      }).then((user) => {
        // Load payday, then check is current month past pay date
        // If no payday is set, then just use beginning of month
        // Load transactions since last payday, make multiple calls if necessary (possibly implment this in Monzo Service)
        const results = {}; 
        results.payday = user.payday_day;
        results.budgets = user.Budgets; 

        let since;
        const currentDay = moment().date(); 
        
        if (user.payday_day) {
          if (currentDay >= user.payday_day) {
            since = moment().date(user.payday_day).hour(0).minute(0).second(0); 
          } else {
            since = moment().subtract(1, 'months').date(user.payday_day).hour(0).minute(0).second(0);
          }
        } else {
          since = moment().date(0).hour(0).minute(0).second(0);
        }

        let month = since.format('Do MMMM');
        results.month = month;

        monzo.accessToken = access_token;
        monzo.getTransactions(user.monzo_acc_id, true, {since: since.toISOString()}, access_token)
          .then((transactions) => {
            let resultTransactions = [];
            let spenttransactions = transactions.filter((el) => { return !el.is_load; });

            // split transactions into groups by cat 
            spenttransactions.forEach((transaction) => {
              let res = resultTransactions.find((element) => { return element.category === transaction.category; });
              if (res === undefined) {
                // If category not in result then add 
                resultTransactions.push({
                  category: transaction.category, 
                  totalspend: Math.abs(transaction.amount), 
                  transactions: [transaction] 
                });
              } else {
                res.totalspend = res.totalspend + Math.abs(transaction.amount); 
                res.transactions.push(transaction);
              }
            });

            results.transactions = resultTransactions;
            resolve(results);
          });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  saveBudgetForUser(cat_id, user_id, value) {
    return new Promise((resolve, reject) => {
      const where = {}; 
      where[budgetAttributeMap.USER_ID] = user_id; 
      where[budgetAttributeMap.CATEGORY_ID] = cat_id; 
      
      models.Budget.find({where:where}).then((result) => {
        // If exists then update existing budget for user
        // Else then create a new one
        if (result) {
          const update = {};
          update[budgetAttributeMap.VALUE] = value;
          result.updateAttributes(update).then((result) => {
            resolve(result);
          });
        } else {
          const toCreate = {}; 
          toCreate[budgetAttributeMap.USER_ID] = user_id; 
          toCreate[budgetAttributeMap.CATEGORY_ID] = cat_id; 
          toCreate[budgetAttributeMap.VALUE] = value;

          models.Budget.create(toCreate).then((created) => {
            resolve(created);
          });
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

const budgetAttributeMap = {
  ID: "id", 
  CATEGORY_ID: "budget_cat_id", 
  USER_ID: "budget_user_id", 
  VALUE: "budget_value"
};

export default BudgetService;