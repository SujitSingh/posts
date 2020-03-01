// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const appConfig = require('./utils/config');

const app = express();
const PORT = 8082;

const feetRoutes = require('./apis/routes/feed');

app.use(cors()); // enable CORS
app.use(express.json()); // body parsing
app.use(express.static(path.join(rootDir, 'public'))); // public folder

app.use('/feed', feetRoutes);

// default error handler
app.use((error, req, res, next) => {
  const message = error.message;
  res.status(error.statusCode || 500).send({ ...error, message });
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