const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  res.send({
    posts: [
      {
        _id: 'sdsks',
        title: 'First post',
        content: 'Content for the post',
        imageUrl: '/images/book-img.jpeg',
        creator: {
          name: 'Sujit'
        },
        createdAt: new Date()
      }
    ]
  });
}

exports.createPost = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    // validation failed
    return res.status(422).send({
      error: error.array(),
      message: 'Failed to create post due to data validation failure'
    });
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
    res.send(error);
  });
}