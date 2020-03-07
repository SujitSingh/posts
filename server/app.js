// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');

const appConfig = require('./utils/config');

const app = express();
const PORT = 8082;

const feetRoutes = require('./apis/routes/feed');
const authRoutes = require('./apis/routes/auth');

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

// default error handler
app.use((error, req, res, next) => {
  const message = error.message;
  const data = error.data;
  res.status(error.statusCode || 500).send({ ...error, message, data });
});

mongoose.connect(appConfig.mongoDBPath, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
  .then(success => {
    console.log('DB connected');
    app.listen(PORT, ()=> {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }).catch(error => {
    console.error('DB connection failed', error);
  });