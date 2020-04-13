const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = {
  createUser: async ({ userInput }, req) => {
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