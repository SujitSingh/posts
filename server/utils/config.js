const appConfig = {
  mongoDBPath: 'mongodb://root:passw0rd@localhost:27017/posts_rest_nosql',
  postImgsRoot: 'server/public/images',
  passwordSaltRound: 10,
};

module.exports = appConfig;