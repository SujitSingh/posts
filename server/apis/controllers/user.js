const User = require('../models/user');

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.send({
      status: user.status
    });
  } catch(error) {
    next(error);
  }
}

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.send({
      message: 'Updated status',
      status: newStatus
    });
  } catch(error) {
    next(error);
  }
}