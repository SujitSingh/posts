const express = require('express');
const PORT = 8082;
const app = express();

const feetRoutes = require('./routes/feed');

app.use((req, res, next)=> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Control-Type, Authorization');
  next();
});

app.use('/feed', feetRoutes);

app.listen(PORT, ()=> {
  console.log(`Server running at http://localhost:${PORT}`);
});