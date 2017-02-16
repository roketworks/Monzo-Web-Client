'use strict';

import express from 'express';
const router = express.Router();

router.post('/webhook', function(req, res, next){
  // When webhook is sent from monzo
  console.log(req);
});

export default router;