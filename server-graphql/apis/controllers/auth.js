const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const appConfig = require('../../utils/config');

exports.signup = async (req, res, next) => {
  const email = req.body.email,
        name = req.body.name,
        password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      // user already exists
      const error = new Error('User already esists');
      error.statusCode = 422;
      throw error;
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, appConfig.passwordSaltRound);
    // create the user
    const newUser = new User({
      email, name,
      password: hashedPassword,
      posts: []
    });
    const createdUser = await newUser.save();
    // user created
    res.send({
      message: 'User created',
      userId: createdUser._id
    });
  } catch(error) {
    next(error);
  }
}

exports.login = async (req, res, next) => {
  const email = req.body.email,
        password = req.body.password;

  try {
    const userObj = await User.findOne({ email: email });
    if (!userObj) {
      const error = new Error(`User not found`);
      error.statusCode = 401;
      throw error;
    }
    // compare password hash
    const result = await bcrypt.compare(password, userObj.password);
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
      appConfig.tokenSecret,
      { expiresIn: '1d' }
    );
    res.send({
      token: token,
      userId: userObj._id.toString()
    });
  } catch(error) {
    next(error);
  }
}