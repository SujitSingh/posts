const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const appConfig = require('../../utils/config');
const filesUtil = require('../../utils/files');

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
      return error;
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
      return error;
    }
  },
  posts: async ({ page }, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    page = page ? page : 1;
    const perPage = 2;
    try {
      const totalPosts = await Post.find().countDocuments();
      const posts = await Post.find()
                              .sort({ createdAt: -1 })
                              .skip((page - 1) * perPage)
                              .limit(perPage)
                              .populate('creator');
      const postsArr = posts.map(post => {
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        };
      });
      return {
        totalPosts, 
        posts: postsArr
      };
    } catch(error) {
      return error;
    }
  },
  post: async ({ id }, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    try {
      const post = await Post.findById(id).populate('creator');
      if (!post) {
        const error = new Error('No post found');
        error.code = 404;
        throw error;
      }
      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
      };
    } catch (error) {
      return error;
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
      return error;
    }
  },
  updatePost: async ({ id, postInput }, req) => {
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
      const post = await Post.findById(id).populate('creator');
      if (!post || (post.creator._id.toString() !== req.userId)) {
        const error = new Error('Post not found');
        error.code = 404;
        throw error;
      }
      post.title = postInput.title;
      post.content = postInput.content;
      if (postInput.imageUrl !== 'undefined') {
        // new image provided
        post.imageUrl = postInput.imageUrl;
      }
      const updatedPost = await post.save();
      return {
        ...updatedPost._doc,
        _id: updatedPost._id.toString(),
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
      }
    } catch (error) {
      return error;
    }
  },
  deletePost: async ({ id }, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    try {
      const post = await Post.findById(id).populate('creator');
      if (!post || (post.creator._id.toString() !== req.userId)) {
        const error = new Error('Post not found');
        error.code = 404;
        throw error;
      }
      // delete associated image
      filesUtil.deleteFile('public' + post.imageUrl);

      await Post.findByIdAndRemove(id); // remove post
      // remove from User's posts array too
      const user = await User.findById(req.userId);
      user.posts.pull(id);
      await user.save();
      return {
        postDeleted: true
      };
    } catch (error) {
      return error;
    }
  },
  user: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    try {
      const user = await User.findById(req.userId);
      if (!user || (user._id.toString() !== req.userId)) {
        const error = new Error('User not found');
        error.code = 404;
        throw error;
      }
      return {
        ...user._doc,
        _id: user._id.toString(),
      };
    } catch (error) {
      return error;
    }
  },
  updateUserStatus: async ({ status }, req) => {
    if (!req.isAuth) {
      const error = new Error('Authentication failed');
      error.code = 401;
      throw error;
    }
    try {
      const user = await User.findById(req.userId);
      if (!user || (user._id.toString() !== req.userId)) {
        const error = new Error('User not found');
        error.code = 404;
        throw error;
      }
      user.status = status; // update new status
      await user.save();
      return {
        ...user._doc,
        _id: user._id.toString()
      };
    } catch (error) {
      return error;
    }
  }
}