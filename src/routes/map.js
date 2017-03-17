'use strict';

import express from 'express';
import Monzo from '../services/monzo';
import sessionHelper from '../utils/sessionHelper';

const router = express.Router();
const monzoService = new Monzo();

router.get('/', function(req, res, next){
  return res.render('map');
});

// TODO: possibly move into transaction router
router.get('/json', function(req, res, next){
  // Todo, some sort of pagination
  const sessionData = sessionHelper.getSessionData(req);
  monzoService.accessToken = sessionData.token.token.access_token;

  monzoService.getAccountIdDb(sessionData.monzo_user_id).then((account_id) => {
    return monzoService.getTransactions(account_id, true, {});
  }).then((transactions) => {
    return res.json(transactions.filter(function(value){ return value.is_load === false; })); 
  }).catch((err) => {
    return next(err);
  });
});

export default router;