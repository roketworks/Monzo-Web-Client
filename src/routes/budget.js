'use strict';

import express from 'express';
import moment from 'moment';
import sessionHelper from '../utils/sessionHelper';
import BudgetService from '../services/budget';
import CategoryService from '../services/category';
import transactionUtil from '../utils/transactionUtil';

const router = express.Router(); 
const budgetService = new BudgetService();
const categoryService = new CategoryService();

router.get('/', function(req, res, next) {
  const sessionData = sessionHelper.getSessionData(req);

  let month;
  if (req.query.month === undefined) {
    month = moment().month(); 
  } else {
    month = parseInt(req.query.month);
  }

  categoryService.getAll().then((categories) => {
    budgetService.getBudgetsForUser(sessionData.user_id, month, sessionData.token.token.access_token).then((result) => {
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

      const totalBudget = resultBudgets.reduce((acc, value) => acc + value.budget, 0);

      return res.render('budgeting', {
        title: 'Budgets',
        payday: result.payday,
        monthName: result.month, // TODO: refactor out of budget service
        spend: transactionUtil.formatMoney(totalSpend, true),
        budgets: resultBudgets, 
        totalBudget: transactionUtil.formatMoney(totalBudget * 100, true), // TODO: refactor formatMoney into formatMoneySmall, formatMoneyLarge etc
        categories: categories, 
        nextMonth: getNextMonth(month),
        prevMonth: moment().month(month).subtract(1, 'months').month(),
      });
    }).catch((err) => {
      next(err);
    });
  }).catch((err) => {
    next(err);
  }); 
});

router.post('/', function(req, res, next) {
  let budgets = req.body.budgets; //.filter((el) => { return el.value > 0; }); 
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

const getNextMonth = (current) => {
  var n = moment().month(current).add(1, 'months').month(); 
  if (!(n > moment().month())) {
    return n
  }                    
};

export default router;