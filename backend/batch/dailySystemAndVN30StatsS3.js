const cron = require('node-cron');
const pool = require('../db');
const { truncateDecimal, readAllCSVFilesFromS3 } = require('../utils/utils');
const path = require('path');
const bucket = 'smooth-bucket-s3';
const prefix = 'sys_and_vn30_pnl/';

async function saveDailySystemAndVN30Stats(rows) {
  // Gom nhóm dữ liệu theo date
  const dailyStats = {};

  for (const row of rows) {
    const date = new Date(row.Datetime).toISOString().split('T')[0];
    const gain = truncateDecimal(row.total_gain || 0, 6);
    const gainVn30 = truncateDecimal(row.total_gain_vn30 || 0, 6);

    if (!dailyStats[date]) {
      dailyStats[date] = { gain: 0, gainVn30: 0 };
    }

    dailyStats[date].gain += gain;
    dailyStats[date].gainVn30 += gainVn30;
  }

  // Tính cumulative sau khi tính gain từng ngày
  const sortedDates = Object.keys(dailyStats).sort((a, b) => new Date(a) - new Date(b));

  let cumulativeGain = 0;
  let cumulativeGainVn30 = 0;
  for (const date of sortedDates) {
    cumulativeGain += dailyStats[date].gain;
    cumulativeGainVn30 += dailyStats[date].gainVn30;

    dailyStats[date].total_gain = truncateDecimal(cumulativeGain, 6);
    dailyStats[date].total_gain_vn30 = truncateDecimal(cumulativeGainVn30, 6);
  }

  // Lưu vào database
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const [date, { gain, total_gain, gainVn30, total_gain_vn30 }] of Object.entries(dailyStats)) {
      await client.query(
        `
        INSERT INTO system_daily_stats (date, gain, total_gain)
        VALUES ($1, $2, $3)
        ON CONFLICT (date) DO NOTHING
        `,
        [date, gain, total_gain]
      );

      await client.query(
        `
        INSERT INTO vn30_daily_stats (date, gain, total_gain)
        VALUES ($1, $2, $3)
        ON CONFLICT (date) DO NOTHING
        `,
        [date, gainVn30, total_gain_vn30]
      );


      console.log(`✅ Inserted system stats ${date}: gain ${gain}, total_gain ${total_gain}, gainVn30 ${gainVn30}, total_gain_vn30 ${total_gain_vn30}`);
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


async function updateDailySystemAndVN30Stats() {
  try {
    const files = await readAllCSVFilesFromS3(bucket, prefix);

    let allRows = []; // mảng chứa toàn bộ dữ liệu từ tất cả file

    for (const file of files) {
      const rows = file.data;
      if (!rows || rows.length === 0) continue;

      // Thêm vào mảng tổng
      allRows = allRows.concat(rows);
    }


    if (allRows.length > 0) {
      await saveDailySystemAndVN30Stats(allRows);
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
cron.schedule('10 1 * * *', updateDailySystemAndVN30Stats);

// Cho chạy tay nếu cần
if (require.main === module) updateDailySystemAndVN30Stats();
