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
const authValidator = require('./apis/services/request-validator');
const filesUtil = require('./utils/files');

const app = express();

app.use(cors()); // enable CORS
app.use(express.json()); // body parsing
app.use(express.static(path.join(rootDir, 'public'))); // public folder

app.use(authValidator.validateAuthToken);

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

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated');
  }
  if (!req.file) {
    return res.status(400).send({
      message: 'No image file provided'
    });
  }
  if (req.body.oldPath) {
    // delete old image
    filesUtil.deleteFile('public' + req.body.oldPath);
  }
  return res.status(201).send({
    message: 'File stored',
    filePath: '/images/' + req.file.filename
  });
});

app.use('/graphql', graphqlExp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn: (error) => {
    if (!error.originalError) {
      return error; // code errors, send as it is
    }
    // send custom error
    return {
      message: error.message || 'Some error occured',
      status: error.originalError.status || 500,
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