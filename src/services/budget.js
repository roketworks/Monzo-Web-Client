'use strict'; 

import models from '../models/index'; 
import Monzo from './monzo';
import moment from 'moment';
import settingsUtils from '../utils/settingsUtil';

const monzo = new Monzo();

class BudgetService { 

  getBudgetsForUser(user_id, current_month, access_token) {
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

        const payday_date = settingsUtils.getPaydayDate(user.payday_day, current_month);
        const before = settingsUtils.getPaydayDate(user.payday_day, current_month + 1);
        let month = moment(payday_date).format('Do MMMM YYYY');
        results.month = month;

        monzo.accessToken = access_token;
        monzo.getTransactions(user.monzo_acc_id, true, {since: payday_date, before: before})
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
          // If setting existing budget to 0, then delete
          // Otherwise update budget value 
          if (parseInt(value) === 0) {
            result.destroy().then(() => { resolve(null); })
          } else {
            const update = {};
            update[budgetAttributeMap.VALUE] = value;
            result.updateAttributes(update).then((result) => {
              resolve(result);
            });
          }
        } else {
          if (parseInt(value) === 0){
            // If the budget exist and we are trying to save one with a value of 0 then skip
            return resolve(null);
          }
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