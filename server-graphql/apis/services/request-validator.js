const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const appConfig = require('../../utils/config');

exports.checkValidationsErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Data validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  next();
}

exports.validateAuthToken = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Token authorization failed');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1]
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, appConfig.tokenSecret);
  } catch(error) {
    error.statusCode = 500; // server error
    throw error;
  }
  if (!decodedToken) {
    const error = new Error('Token authorization failed');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
}