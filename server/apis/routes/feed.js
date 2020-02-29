const express = require('express');
const router = express.Router();

const feedCtrls = require('../controllers/feed');

router.get('/posts', feedCtrls.getPosts);
router.post('/post', feedCtrls.createPost);

module.exports = router;