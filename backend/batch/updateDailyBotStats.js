const { readAllCSVFiles } = require('../services/fbtService');
const path = require('path');
const cron = require('node-cron');
const pool = require('../db');
const {truncateDecimal} = require('../utils/utils');

function getBotIdFromFilename(filename) {
  const name = path.basename(filename, '.csv');
  const id = parseInt(name);
  return isNaN(id) ? null : id;
}

async function updateDailyBotStats() {
  try {
    const files = await readAllCSVFiles();

    for (const file of files) {
      const botId = getBotIdFromFilename(file.filename);
      if (!botId) {
        console.warn(`⚠️ Skipping invalid filename: ${file.filename}`);
        continue;
      }

      const rows = file.data;
      if (!rows || rows.length === 0) continue;

      for (const row of rows) {
        const date = new Date(row.Datetime).toISOString().split('T')[0];
        const gain = truncateDecimal(row.gain || 0, 6);
        const totalGain = truncateDecimal(row.total_gain || 0, 6);

        await pool.query(
          `INSERT INTO daily_bot_stats (bot_id, date, gain, total_gain)
           VALUES ($1, $2, $3, $4)
          ON CONFLICT (bot_id, date) DO NOTHING;
          `,
          [botId, date, gain, totalGain]
        );

        console.log(`✅ Inserted bot ${botId} - date ${date}`);
      }
    }

    console.log('✨ Batch completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Batch error:', err);
    process.exit(1);
  }
}

cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily update bot stats...');
  await updateDailyBotStats();
});