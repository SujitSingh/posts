const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const PORT = 8082;

const appConfig = require('./utils/config');
const server = http.createServer(app);

mongoose.connect(appConfig.mongoDBPath, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
  .then(success => {
    console.log('DB connected');
    server.listen(PORT, ()=> {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }).catch(error => {
    console.error('DB connection failed', error);
  });