const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const appConfig = require('../../utils/config');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  // provided details
  const email = req.body.email,
        name = req.body.name,
        password = req.body.password;

  User.findOne({ email: email }).then(result => {
    if (result) {
      // user already exists
      const error = new Error('User already esists');
      error.statusCode = 422;
      throw error;
    }
    // hash the password
    return bcrypt.hash(password, appConfig.passwordSaltRound);
  }).then(hashedPassword => {
    // create the user
    const newUser = new User({
      email, name,
      password: hashedPassword,
      posts: []
    });
    return newUser.save();
  }).then(created => {
    // user created
    res.send({
      message: 'User created',
      userId: created._id
    });
  }).catch(error => {
    next(error);
  });
}