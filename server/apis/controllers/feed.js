const { validationResult } = require('express-validator');
const Post = require('../models/post');
const filesUtil = require('../../utils/files');

exports.getPosts = (req, res, next) => {
  Post.find().then(posts => {
    res.send({ posts });
  }).catch(error => {
    next(error);
  });
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId).then(post => {
    if (!post) {
      // post not found
      const error = new Error('Could not find the post');
      error.statusCode = 404;
      throw error;
    }
    // post found
    res.send({ post });
  }).catch(error => {
    next(error);
  });
}

exports.createPost = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    // validation failed
    const customError = new Error('Failed to create post due to data validation failure');
    customError.statusCode = 422;
    customError.errors = error.array();
    throw customError;
  }
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
    creator: {
      name: 'Sujit'
    }
  });
  post.save().then(result => {
    res.send({
      message: 'Post created successfully',
      post: result
    });
  }).catch(error => {
    next(error);
  });
}

exports.updatePost = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    // validation failed
    const customError = new Error('Failed to create post due to data validation failure');
    customError.statusCode = 422;
    customError.errors = error.array();
    throw customError;
  }

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

  Post.findById(postId).then(post => {
    if (!post) {
      const error = new Error('Post not available');
      error.statusCode = 404;
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
    return post.save();
  })
    .then(updatedPost => {
      res.send(updatedPost);
    }).catch(error => {
      next(error);
    });
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId).then(post => {
    if (!post) {
      const error = new Error('Post not available');
      error.statusCode = 404;
      throw error;
    }
    // delete image
    filesUtil.deleteFile('public', post.imageUrl);
    // deleted post
    return Post.findByIdAndRemove(postId);
  }).then(deleted => {
    res.send({
      message: 'Post deleted'
    });
  }).catch(error => {
    next(error);
  });
}