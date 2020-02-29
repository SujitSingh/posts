const express = require('express');
const cors = require('cors')
const app = express();
const PORT = 8082;

const feetRoutes = require('./routes/feed');

app.use(cors());
app.use(express.json());
app.use('/feed', feetRoutes);

app.listen(PORT, ()=> {
  console.log(`Server running at http://localhost:${PORT}`);
});