// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8082;

const feetRoutes = require('./apis/routes/feed');

app.use(cors()); // enable CORS
app.use(express.json()); // body parsing
app.use(express.static(path.join(rootDir, 'public'))); // public folder

app.use('/feed', feetRoutes);

app.listen(PORT, ()=> {
  console.log(`Server running at http://localhost:${PORT}`);
});