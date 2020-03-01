const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  Post.find().then(posts => {
    res.send({ posts });
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

  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl: '/images/book-img.jpeg',
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