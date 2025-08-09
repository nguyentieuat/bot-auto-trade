const cron = require('node-cron');
const pool = require('../db');
const { truncateDecimal, readAllCSVFiles } = require('../utils/utils');
const path = require('path');

async function saveDailySystemStats(rows) {
  // Gom nhóm dữ liệu theo date
  const dailyStats = {};

  for (const row of rows) {
    const date = new Date(row.Datetime).toISOString().split('T')[0];
    const gain = truncateDecimal(row.gain || 0, 6);
    const totalGain = truncateDecimal(row.total_gain || 0, 6);

    if (!dailyStats[date]) {
      dailyStats[date] = { gain: 0, total_gain: 0 };
    }

    dailyStats[date].gain += gain;
    dailyStats[date].total_gain += totalGain;
  }

  // Lưu vào database
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const [date, { gain, total_gain }] of Object.entries(dailyStats)) {
      await client.query(
        `
        INSERT INTO system_daily_stats (date, gain, total_gain)
        VALUES ($1, $2, $3)
        ON CONFLICT (date) DO NOTHING
        `,
        [date, truncateDecimal(gain, 6), truncateDecimal(total_gain, 6)]
      );

       console.log(`✅ Inserted system stats ${date}: gain ${gain}, total_gain ${total_gain}`);
    }

    await client.query('COMMIT');
    console.log(`✅ Saved daily stats for ${Object.keys(dailyStats).length} days`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


async function updateDailySystemStats() {
  try {
    const dataDir = path.join(__dirname, '..', 'data', 'sys_trade');
    const files = await readAllCSVFiles(dataDir);

    let allRows = []; // mảng chứa toàn bộ dữ liệu từ tất cả file

    for (const file of files) {
      const rows = file.data;
      if (!rows || rows.length === 0) continue;

      // Thêm vào mảng tổng
      allRows = allRows.concat(rows);
    }


    if (allRows.length > 0) {
      await saveDailySystemStats(allRows);
      console.log(`✨ Batch completed. Total rows: ${allRows.length}`);
    } else {
      console.log('⚠️ No data found to process.');
    }

    console.log('✨ Batch completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Batch error:', err);
    process.exit(1);
  }


}

// Chạy hàng ngày lúc 1:10 sáng
cron.schedule('10 1 * * *', updateDailySystemStats);

// Cho chạy tay nếu cần
if (require.main === module) updateDailySystemStats();
