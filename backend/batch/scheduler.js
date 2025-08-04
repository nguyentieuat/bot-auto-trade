const cron = require('node-cron');
const updateStats = require('./updateDailyStats');

cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily update...');
  await updateStats();
});