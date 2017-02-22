'use strict';

import express from 'express';
import sessionHelper from '../utils/sessionHelper';
import BudgetService from '../services/budget';
import CategoryService from '../services/category';
import transactionUtil from '../utils/transactionUtil';

const router = express.Router(); 
const budgetService = new BudgetService();
const categoryService = new CategoryService();

router.get('/', function(req, res, next) {
  const sessionData = sessionHelper.getSessionData(req);

  categoryService.getAll().then((categories) => {
    budgetService.getBudgetsForUser(sessionData.user_id, sessionData.token.token.access_token).then((result) => {
      // Correlate transactions & budgets, possibly move into service 
      const resultBudgets = [];

      const budgets = result.budgets; 
      budgets.forEach((b) => {
        resultBudgets.push(createDisplayBudget(b.Category.cat_id, b.Category.cat_name, b.budget_value, 0));
      });

      let totalSpend = 0; 
      result.transactions.forEach((el) => { totalSpend = totalSpend + el.totalspend; });
      
      result.transactions.forEach((transaction) => {
        let budget = resultBudgets.find((el) => { return el.category === transaction.category; }); 
        if (budget === undefined) {
          // TODO: handle when budget isnt set
          resultBudgets.push(createDisplayBudget(transaction.category, 
            transactionUtil.getTransactionDisplayName(transaction.category), 0, transaction.totalspend));
          
        } else { 
          budget.currentSpend = transaction.totalspend / 100;
        }
      });

      return res.render('budgeting', {
        payday: result.payday,
        month: result.month,
        spend: transactionUtil.formatMoney(totalSpend, true),
        budgets: resultBudgets, 
        categories: categories
      });
    });
  }).catch((err) => {
    next(err);
  }); 
});

router.post('/', function(req, res, next) {
  let budgets = req.body.budgets.filter((el) => { return el.value > 0; }); 
  const sessionData = sessionHelper.getSessionData(req);

  categoryService.getAll().then((categories) => {
    let promises = [];
    budgets.forEach((budget) => {
      const cat_id = categories.find((el) => { return el.cat_id === budget.category; }).id;
      const user_id = sessionData.user_id;
      const value = budget.value;
      promises.push(budgetService.saveBudgetForUser(cat_id, user_id, value));
    });
    Promise.all(promises).then((values) => {
      res.status(200).send(JSON.stringify(values));
    }).catch((err) => {
      next(err);
    });
  });
});

const createDisplayBudget = (category, categoryDisplay, budget, currentSpend) => {
  if (!budget) { 
    budget = 0;
  }

  var res = {
    category: category, 
    categoryDisplayName: categoryDisplay, 
    budget: budget, 
    currentSpend: currentSpend/100
  };

  return res;
};

export default router;