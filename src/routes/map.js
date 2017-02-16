'use strict';

import express from 'express';
import monzo from '../utils/monzoUtil';
import sessionHelper from '../utils/sessionHelper';

const router = express.Router();

router.get('/', function(req, res, next){
  return res.render('map');
});

router.get('/json', function(req, res, next){
  // Todo, some sort of pagination
  const sessionData = sessionHelper.getSessionData(req);

  monzo.getAccountIdDb(sessionData.user_id).then((account_id) => {
    return monzo.getTransactions(account_id, true, {}, sessionData.token.token.access_token);
  }).then((transactions) => {
    return res.json(transactions.filter(function(value){ return value.is_load === false})); 
  }).catch((err) => {
    return next(err);
  });
});

export default router;