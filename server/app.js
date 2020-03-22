// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const appConfig = require('./utils/config');

const app = express();

const feetRoutes = require('./apis/routes/feed');
const authRoutes = require('./apis/routes/auth');
const userRoutes = require('./apis/routes/user');

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

// using routes
app.use('/feed', feetRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// default error handler
app.use((error, req, res, next) => {
  const message = error.message;
  const data = error.data;
  res.status(error.statusCode || 500).send({ ...error, message, data });
});

module.exports = app;