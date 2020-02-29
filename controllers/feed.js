module.exports.getPosts = (req, res, next) => {
  res.send('GET- Get posts');
}

module.exports.createPost = (req, res, next) => {
  res.send('POST- Create post');
}