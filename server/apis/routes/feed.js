const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const validationSrc = require('../services/request-validator');

const feedCtrls = require('../controllers/feed');

router.get('/posts', feedCtrls.getPosts);
router.get('/post/:postId', feedCtrls.getPost);

router.post('/post', 
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  validationSrc.checkValidationsErrors,
  feedCtrls.createPost
);

router.put('/post/:postId', 
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  validationSrc.checkValidationsErrors,
  feedCtrls.updatePost
);

router.delete('/post/:postId', feedCtrls.deletePost);

module.exports = router;