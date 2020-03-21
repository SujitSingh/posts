const { validationResult } = require('express-validator');

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