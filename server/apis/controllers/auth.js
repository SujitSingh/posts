const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

exports.login = (req, res, next) => {
  const email = req.body.email,
        password = req.body.password;
  let userObj;
  User.findOne({ email: email }).then(user => {
    if (!user) {
      const error = new Error(`User not found`);
      error.statusCode = 401;
      throw error;
    }
    userObj = user;
    // compare password hash
    return bcrypt.compare(password, user.password);
  }).then(result => {
    if (!result) {
      const error = new Error(`User credentials were incorrect`);
      error.statusCode = 401;
      throw error;
    }
    // generate JWT token
    const token = jwt.sign(
      {
        email: userObj.email,
        userId: userObj._id.toString(),
      },
      'jwt-secret-token-string',
      { expiresIn: '1d' }
    );
    res.send({
      token: token,
      userId: userObj._id.toString()
    });
  }).catch(error => {
    next(error);
  });
}