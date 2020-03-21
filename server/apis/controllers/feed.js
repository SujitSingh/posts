const Post = require('../models/post');
const User = require('../models/user');
const filesUtil = require('../../utils/files');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page && parseInt(req.query.page) || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      // fetch post for particular range
      return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
    }).then(posts => {
      res.send({
        posts,
        totalItems
      });
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
  post.save().then(async (result) => {
    try {
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
  }).catch(error => {
    next(error);
  });
}

exports.updatePost = (req, res, next) => {
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
  const currentUserId = req.userId;
  Post.findById(postId).then(post => {
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
    return Post.findByIdAndRemove(postId);
  }).then(async deleted => {
    // remove the delted post reference from User's object
    try {
      const user = await User.findById(currentUserId);
      user.posts.pull(postId);
      await user.save();
      res.send({
        message: 'Post deleted'
      });
    } catch(error) {
      next(error);
    }
  }).catch(error => {
    next(error);
  });
}