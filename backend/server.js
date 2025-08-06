const express = require('express');
const cors = require('cors');
const { getAllActiveBotStats } = require('./controllers/fbtController');
const { updateUserInfoByUsername, changePasswordByUsername, getUserProfileByUsername, createInvestment, getInvestmentOrdersByUsername, getSubscriptionByUsernameAndBotName } = require('./controllers/accountController');
const { getActiveBots, getBotChanelsByBotName } = require('./controllers/botController');
const { getAllSubscriptionPackages } = require('./controllers/subscriptionController');
const { getSystemBankInfo, depositBankUser, depositHistoryUser, withdrawBankUser, withdrawHistoryUser } = require('./controllers/systemBankController');
const authRoutes = require('./auth/authRouter');
const adminRouter = require('./auth/adminRouter');
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
app.get('/api/subscriptions/:username/:botName', authenticateToken, getInvestmentOrdersByUsername);

// Bot
app.get('/api/bots/active', getActiveBots);
app.post("/api/investments", authenticateToken, createInvestment);
app.get('/api/bot-chanel/:botName', getBotChanelsByBotName);

app.get('/api/subscription-packages', getAllSubscriptionPackages);

app.get('/api/wallet/system-bank-info', authenticateToken, getSystemBankInfo);
app.post('/api/deposit/:username', authenticateToken, depositBankUser);
app.get('/api/deposit-history/:username', authenticateToken, depositHistoryUser);

app.post('/api/withdraw/:username', authenticateToken, withdrawBankUser);
app.get('/api/withdraw-history/:username', authenticateToken, withdrawHistoryUser);

// Admin
app.use(adminRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
