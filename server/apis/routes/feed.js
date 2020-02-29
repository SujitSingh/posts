const express = require('express');
const { body } = require('express-validator/check');

const router = express.Router();

const feedCtrls = require('../controllers/feed');

router.get('/posts', feedCtrls.getPosts);
router.post('/post', 
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedCtrls.createPost
);

module.exports = router;