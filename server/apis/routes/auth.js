const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

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
  authCtrls.signup
);

module.exports = router;