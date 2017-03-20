'use strict';

import express from 'express';
import moment from 'moment';
import Monzo from '../services/monzo';
import UserService from '../services/user';
import { userAttributeMap } from '../services/user';
import sessionHelper from '../utils/sessionHelper';
import settingsUtil from '../utils/settingsUtil';

const router = express.Router();

const monzoService = new Monzo();
const userService = new UserService();

router.get('/', function(req, res, next){
  return res.render('map', {title: 'Map'});
});

router.get('/json', function(req, res, next){
  // Todo, some sort of pagination
  const sessionData = sessionHelper.getSessionData(req);
  monzoService.accessToken = sessionData.token.token.access_token;

  monzoService.getAccountIdDb(sessionData.monzo_user_id).then((account_id) => {
    const since = moment().subtract(1, 'months').toISOString();
    return monzoService.getTransactions(account_id, true, {since: since}); 
  }).then((transactions) => {
    const transactionFilter = function(value) { 
      return value.is_load === false && value.merchant.online === false; 
    };
    
    return res.json(transactions.filter(transactionFilter)); 
  }).catch((err) => {
    return next(err);
  });
});

export default router;