const bcrypt = require('bcrypt');
const validator = require('validator');

const User = require('../models/user');

module.exports = {
  createUser: async ({ userInput }, req) => {
    const errors = [];
    if (!validator.isEmail(userInput.email) || !validator) {
      errors.push({ message: 'Invalid email' });
    }
    if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
      errors.push({ message: 'Password field should be min 5 characters long' });
    }
    if (errors.length) {
      throw new Error(JSON.stringify(errors)); // send validation errors
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw
    });
    const createdUser = await user.save();
    return {
      _id: createdUser._id.toString(),
      ...createdUser._doc
    };
  }
}