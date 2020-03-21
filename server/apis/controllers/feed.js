const Post = require('../models/post');
const User = require('../models/user');
const filesUtil = require('../../utils/files');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page && parseInt(req.query.page) || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();
    // fetch post for particular range
    const posts = await Post.find()
                            .skip((currentPage - 1) * perPage)
                            .limit(perPage)
                            .populate({
                              path: 'creator',
                              select: 'name email'
                            });

    res.send({ posts, totalItems });
  } catch(error) {
    next(error);
  }
}

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId)
                          .populate({
                            path: 'creator',
                            select: 'name email'
                          });
    if (!post) {
      // post not found
      const error = new Error('Could not find the post');
      error.statusCode = 404;
      throw error;
    }
    // post found
    res.send({ post });
  } catch(error) {
    next(error);
  }
}

exports.createPost = async (req, res, next) => {
  if (!req.file) {
    // no image provided
    const customError = new Error('Image not provided');
    error.customError = 422;
    throw customError;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imagePath = '/images/' + req.file.filename;

  const post = new Post({
    title,
    content,
    imageUrl: imagePath,
    creator: req.userId
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    creator = user;
    user.posts.push(post);
    await user.save();
    // send response
    res.send({
      message: 'Post created successfully',
      post: post,
      creator: {
        _id: creator._id.toString(),
        name: creator.name
      }
    });
  } catch(error) {
    next(error);
  }
}

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imagePath = req.body.image;
  if (req.file) {
    // new image provided
    imagePath = '/images/' + req.file.filename;
    oldFileToDelete = true;
  }

  if(!imagePath) {
    // image path not present
    const error = new Error('No image file mentioned');
    error.statusCode = 422;
    return next(error);
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not available');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      // different user tried deleting
      const error = new Error('Not authorized to edit this post');
      error.statusCode = 403;
      throw error;
    } 
    if (post.imageUrl !== imagePath) {
      // new image path has been provided, delete previous
      filesUtil.deleteFile('public' + post.imageUrl);
    }
    // update details
    post.title = title;
    post.content = content;
    post.imageUrl = imagePath;
    const updatedPost = await post.save();
    res.send(updatedPost);
  } catch(error) {
    next(error);
  }
}

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const currentUserId = req.userId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not available');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== currentUserId) {
      // different user tried deleting
      const error = new Error('Not authorized to delete');
      error.statusCode = 403;
      throw error;
    }
    // delete image
    filesUtil.deleteFile('public', post.imageUrl);
    // deleted post
    const deleted = await Post.findByIdAndRemove(postId);
    // remove the delted post reference from User's object
    const user = await User.findById(currentUserId);
    user.posts.pull(postId);
    await user.save();
    res.send({
      message: 'Post deleted'
    });
  } catch (error) {
    next(error);
  }
}