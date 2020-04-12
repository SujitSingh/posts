const appConfig = {
  mongoDBPath: 'mongodb://root:passw0rd@localhost:27017/posts_rest_nosql',
  postImgsRoot: 'server-graphql/public/images',
  passwordSaltRound: 10,
  tokenSecret: 'jwt-secret-token-string'
};

module.exports = appConfig;