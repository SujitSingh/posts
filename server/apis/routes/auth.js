const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validationSrc = require('../services/request-validator');

const authCtrls = require('../controllers/auth');

router.post('/signup',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email is invalid'),
    body('name')
      .trim()
      .isLength({ min: 5, max: 50 }),
    body('password')
      .trim()
      .isLength({ min: 5 })
  ],
  validationSrc.checkValidationsErrors,
  authCtrls.signup
);

router.post('/login',
  [
    body('email', 'Email is invalid')
      .trim()
      .isEmail(),
    body('password', 'Password should be min 5 chars long')
      .trim()
      .isLength({ min: 5 })
  ],
  validationSrc.checkValidationsErrors,
  authCtrls.login
);

module.exports = router;