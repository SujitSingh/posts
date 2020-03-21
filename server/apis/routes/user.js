const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const validationSrc = require('../services/request-validator');

const userCtrls = require('../controllers/user');

router.get('/status', validationSrc.validateAuthToken, userCtrls.getUserStatus);

router.post('/status',
  validationSrc.validateAuthToken,
  [
    body('status')
      .trim()
      .isLength({ min: 5 })
  ],
  validationSrc.checkValidationsErrors,
  userCtrls.updateUserStatus
);

module.exports = router;