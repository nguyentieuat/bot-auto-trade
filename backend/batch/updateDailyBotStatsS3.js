const path = require('path');
const cron = require('node-cron');
const pool = require('../db');
const { truncateDecimal, readAllCSVFilesFromS3 } = require('../utils/utils');
const bucket = 'smooth-bucket-s3';
const prefix = 'daily_pnl/';

async function getOrInsertBotId(botName) {
  const result = await pool.query('SELECT id FROM bots WHERE name_org = $1', [botName]);
  if (result.rows.length > 0) return result.rows[0].id;

  // Nếu chưa có thì insert
  const insert = await pool.query(
    `INSERT INTO bots (name, name_org, created_at)
     VALUES ($1, $1, NOW()) RETURNING id`,
    [botName]
  );

  return insert.rows[0].id;
}

async function saveDailyStats(botId, botName, rows) {
  for (const row of rows) {
    const date = new Date(row.Datetime).toISOString().split('T')[0];
    const gain = truncateDecimal(row.gain || 0, 6);
    const totalGain =  truncateDecimal(row.total_gain || 0, 6);

    try {
      await pool.query(
        `INSERT INTO daily_bot_stats (bot_id, date, gain, total_gain)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (bot_id, date) DO NOTHING`,
        [botId, date, gain, totalGain]
      );
      console.log(`✅ Inserted bot ${botName} - ${date}: gain ${gain}, total_gain ${totalGain}`);
    } catch (err) {
      console.error(`❌ Failed insert for ${botName} on ${date}:`, err.message);
    }
  }
}

async function updateDailyBotStats() {
  try {
    const files = await readAllCSVFilesFromS3(bucket, prefix);

    for (const file of files) {
      const botName = path.basename(file.filename, '.csv');
      const rows = file.data;
      if (!rows || rows.length === 0) continue;

      const botId = await getOrInsertBotId(botName);
      await saveDailyStats(botId, botName, rows);
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

if (require.main === module) {
  updateDailyBotStats();
}