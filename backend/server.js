const express = require('express');
const cors = require('cors');
const { getAllActiveBotStats } = require('./controllers/fbtController');
const { updateUserInfoByUsername, changePasswordByUsername, getUserProfileByUsername, getUserInfoByUsername, createInvestment, getInvestmentOrdersByUsername, getSubscriptionByUsernameAndBotName, getUserInvestmentSummary, getUserProfits, getUserBotSubcribedGains } = require('./controllers/accountController');
const { getActiveBots, getBotChanelsByBotName, getAllSubscriptionBot } = require('./controllers/botController');
const { getSystemBankInfo, depositBankUser, depositHistoryUser, withdrawBankUser, withdrawHistoryUser } = require('./controllers/systemBankController');
const authRoutes = require('./auth/authRouter');
const adminRouter = require('./auth/adminRouter');
const authenticateToken = require('./auth/authMiddleware');
const { getPackages, getTimeDiscounts, guestJoin, caculatePrice, confirmSubscription, subscribeBot } = require('./controllers/packageController');

require('./batch/updateDailyBotStats');
require('./batch/dailyUserProfits');


const app = express();
app.use(express.json());


const allowedOrigins = [
  'https://bot-auto-trade.vercel.app', // <-- Frontend domain
  'http://localhost:3000'              // <-- Cho dev local
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Cho phép gửi token hoặc cookie nếu có
};

app.use(cors(corsOptions));

// API route
app.get('/api/fbt-data', getAllActiveBotStats);
app.use(authRoutes);


// Account
app.put('/api/users/:username/info', authenticateToken, updateUserInfoByUsername);
app.put('/api/users/:username/change-password', authenticateToken, changePasswordByUsername);
app.get('/api/users/:username', authenticateToken, getUserInfoByUsername);
app.get('/api/users/:username/info', authenticateToken, getUserProfileByUsername);
app.get('/api/investment-orders/:username', authenticateToken, getInvestmentOrdersByUsername);
app.get('/api/subscriptions/:username/:botName', authenticateToken, getSubscriptionByUsernameAndBotName);
app.get('/api/investment-summary/:username', authenticateToken, getUserInvestmentSummary);
app.get('/api/user-profits/:username', authenticateToken, getUserProfits);
app.get('/api/users/:username/subscribed-bots/gains', authenticateToken, getUserBotSubcribedGains);

// Bot
app.get('/api/bots/active', getActiveBots);
app.post("/api/investments", authenticateToken, createInvestment);
app.get('/api/bot-chanel/:botName', getBotChanelsByBotName);


app.get('/api/subscription-bot-price/:botName', getAllSubscriptionBot);

app.get('/api/wallet/system-bank-info', authenticateToken, getSystemBankInfo);
app.post('/api/deposit/:username', authenticateToken, depositBankUser);
app.get('/api/deposit-history/:username', authenticateToken, depositHistoryUser);

app.post('/api/withdraw/:username', authenticateToken, withdrawBankUser);
app.get('/api/withdraw-history/:username', authenticateToken, withdrawHistoryUser);


app.get('/api/packages', getPackages);
app.get('/api/time-discounts', getTimeDiscounts);
app.post('/api/guest-join', guestJoin);

app.post('/api/subscriptions/calculate-price', authenticateToken, caculatePrice);
app.post('/api/confirm-subscription', authenticateToken, confirmSubscription)
app.post('/api/subscribe/:username/:botName', authenticateToken, subscribeBot);

// Admin
app.use(adminRouter);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
