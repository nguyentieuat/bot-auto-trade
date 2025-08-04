const express = require('express');
const cors = require('cors');
const { getAllActiveBotStats } = require('./controllers/fbtController');
const { updateUserInfoByUsername, changePasswordByUsername, getUserProfileByUsername, createInvestment, getInvestmentOrdersByUsername } = require('./controllers/accountController');
const { getActiveBots } = require('./controllers/botController');
const authRoutes = require('./auth/authRouter');
const authenticateToken = require('./auth/authMiddleware');

require('./batch/updateDailyStats');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API route
app.get('/api/fbt-data', getAllActiveBotStats);
app.use(authRoutes);


// Account
app.put('/api/users/:username/info', authenticateToken, updateUserInfoByUsername);
app.put('/api/users/:username/change-password', authenticateToken, changePasswordByUsername);
app.get('/api/users/:username/info', authenticateToken, getUserProfileByUsername);
app.get('/api/investment-orders/:username', authenticateToken, getInvestmentOrdersByUsername);

// Bot
app.get('/api/bots/active', getActiveBots);
app.post("/api/investments", authenticateToken, createInvestment);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
