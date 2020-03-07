const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, require: true },
  name: { type: String, require: true },
  password: { type: String, require: true },
  status: { type: String, default: 'I am new' },
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Post'
    },
  ]
});

module.exports = mongoose.model('User', userSchema, 'Users');