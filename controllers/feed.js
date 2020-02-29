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
  const title = req.body.title;
  const content = req.body.content;
  res.send({
    _id: new Date().toISOString(),
    title,
    content,
    creator: {
      name: 'Sujit'
    },
    createAt: new Date()
  });
}