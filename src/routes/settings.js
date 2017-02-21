'use strict';

import express from 'express';
import sessionUtil from '../utils/sessionHelper';
import UserService from '../services/user';
import { userAttributeMap } from '../services/user';
import validation from '../utils/validationUtil';

const userService = new UserService();

const router = express.Router();

router.post('/payday', (req, res, next) => {
  // Update User payday date
  const sessiontData = sessionUtil.getSessionData(req);

  let payday = req.body.payday; 
  const validationResult = validation.validatePayday(payday); 
  
  if (!validationResult.isValid){
    return res.json({status: 500, message: validationResult.message});
  }

  const toUpdate = {}; 
  toUpdate[userAttributeMap.USER_ID] = sessiontData.user_id;
  toUpdate[userAttributeMap.PAYDAY] = payday;
  userService.updateUser(toUpdate).then((result) => {
    return res.status(200).json({success: true});
  });
});

export default router;