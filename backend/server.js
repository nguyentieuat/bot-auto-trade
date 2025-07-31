const express = require('express');
const cors = require('cors');
const { getAllFbtData } = require('./controllers/fbtController');
const authRoutes = require('./auth/authRouter');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API route
app.get('/api/fbt-data', getAllFbtData);
app.use(authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
