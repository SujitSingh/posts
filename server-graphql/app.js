// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const graphqlExp = require('express-graphql');

const appConfig = require('./utils/config');
const graphqlSchema = require('./apis/graphql/schema');
const graphqlResolver = require('./apis/graphql/resolver');

const app = express();

app.use(cors()); // enable CORS
app.use(express.json()); // body parsing
app.use(express.static(path.join(rootDir, 'public'))); // public folder

// multer file storage
const multerFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appConfig.postImgsRoot);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});
const multerFileFilter = (req, file, cb) => {
  // multer file type filter
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true); // save file
  } else {
    cb(null, false); // don't save file
  }
}
app.use(multer({ storage: multerFileStorage, fileFilter: multerFileFilter}).single('image'));

app.use('/graphql', graphqlExp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError: (error) => {
    if (!error.originalError) {
      return error; // code errors, send as it is
    }
    // send custom error
    return {
      message: error.message || 'Some error occured',
      code: error.originalError.code || 500,
      data: error.originalError.data
    };
  }
}));

// default error handler
app.use((error, req, res, next) => {
  const message = error.message;
  const data = error.data;
  res.status(error.statusCode || 500).send({ ...error, message, data });
});

module.exports = app;