const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const appConfig = require('../../utils/config');

const User = require('../models/user');
const Post = require('../models/post');

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
      // send validation errors
      const error = new Error('Validation errors');
      error.status = 422;
      error.data = errors;
      throw error;
    }

    try {
      const existingUser = await User.findOne({ email: userInput.email });
      if (existingUser) {
        const error = new Error('User already exists');
        error.code = 422;
        throw error;
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
    } catch(error) {
      next(error);
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    let error;
    if (!user) {
      error = new Error('User not found');
      error.status = 401;
      throw error;
    }
    try {
      // compare password
      const passEqual = await bcrypt.compare(password, user.password);
      if (!passEqual) {
        error = new Error('Wrong credentials');
        error.status = 401;
        throw error;
      }
      // generate JWT token
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email
        },
        appConfig.tokenSecret,
        { expiresIn: '1d' }
      );
      // send user details
      return {
        token,
        userId: user._id.toString()
      };
    } catch(error) {
      next(error);
    }
  },
  posts: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    try {
      const totalPosts = await Post.find().countDocuments();
      const posts = await Post.find()
                              .sort({ createdAt: -1 })
                              .populate('creator');
      const postsArr = posts.map(post => {
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toString(),
          updatedAt: post.updatedAt.toString()
        };
      });
      return {
        totalPosts, 
        posts: postsArr
      };
    } catch(error) {
      console.log(error);
      return error;
      // next(error);
    }
  },
  createPost: async ({ postInput }, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.content, { min: 5 })) {
      errors.push({ message: 'Title and contents are required' });
    }
    if (errors.length) {
      // send validation errors
      const error = new Error('Validation errors');
      error.status = 422;
      error.data = errors;
      throw error;
    }

    try {
      const user = await User.findById(req.userId); // get user info
      if (!user) {
        const error = new Error('Invalid user');
        error.code = 401;
        throw error;
      }
      const post = new Post({
        title: postInput.title,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
        creator: user
      });
      const createdPost = await post.save();
      // add post info to user
      user.posts.push(createdPost);
      await user.save();
      // post created
      return {
        _id: createdPost._id.toString(),
        ...createdPost._doc,
        createdAt: createdPost.createdAt.toISOString(),
        updatedAt: createdPost.updatedAt.toISOString(),
      };
    } catch(error) {
      next(error);
    }
  }
}