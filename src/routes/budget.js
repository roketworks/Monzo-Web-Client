'use strict';

import express from 'express';
import sessionHelper from '../utils/sessionHelper';
import BudgetService from '../services/budgetService'

const router = express.Router(); 
const budgetService = new BudgetService();

router.get('/', function(req, res, next) {
  const sessionData = sessionHelper.getSessionData(req);
  budgetService.getBudgetsForUser(sessionData.user_id).then((result) => {
    return res.render('budget', result);
  });
});