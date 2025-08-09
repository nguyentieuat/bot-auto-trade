require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');
const { truncateDecimal } = require('../utils/utils');


const dataDir = path.join(__dirname, '..', 'data', 'FBT');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function readAllCSVFiles() {
  return new Promise((resolve, reject) => {
    fs.readdir(dataDir, (err, files) => {
      if (err) return reject(err);

      const csvFiles = files.filter(file => file.endsWith('.csv'));
      const result = [];
      let filesProcessed = 0;

      if (csvFiles.length === 0) return resolve([]);

      csvFiles.forEach(file => {
        const filePath = path.join(dataDir, file);
        const rows = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', () => {
            const normalizedRows = rows.map(row => {
              const keys = Object.keys(row);
              const dateKey = keys.find(k => k.toLowerCase().includes('date'));

              if (dateKey && dateKey !== 'Datetime') {
                row['Datetime'] = row[dateKey];
                delete row[dateKey];
              }

              return row;
            });

            result.push({ filename: file, data: normalizedRows });

            filesProcessed++;
            if (filesProcessed === csvFiles.length) {
              resolve(result);
            }
          })
          .on('error', reject);
      });
    });
  });
}

async function upsertBotIfNeeded(botName) {
  const checkBot = await pool.query(`SELECT id FROM bots WHERE name = $1`, [botName]);

  if (checkBot.rowCount > 0) return checkBot.rows[0].id;

  const insertBot = await pool.query(
    `INSERT INTO bots (name, name_org, created_at)
     VALUES ($1, $1, NOW()) RETURNING id`,
    [botName]
  );

  return insertBot.rows[0].id;
}

async function saveStatsToDb() {
  const files = await readAllCSVFiles();

  for (const file of files) {
    const filename = path.basename(file.filename, '.csv'); // use as bot name
    const botId = await upsertBotIfNeeded(filename);

    const rows = file.data;
    for (const row of rows) {
      const date = new Date(row.Datetime).toISOString().split('T')[0];
      const gain = truncateDecimal(row.gain || 0, 6);
      const totalGain = truncateDecimal(row.total_gain || 0, 6);

      try {
        await pool.query(
          `INSERT INTO daily_bot_stats (bot_id, date, gain, total_gain)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (bot_id, date) DO NOTHING`,
          [botId, date, gain, totalGain]
        );
        console.log(`✅ Inserted bot ${filename} - ${date}: data - ${gain} - ${totalGain}`);
      } catch (err) {
        console.error(`❌ Failed insert for ${filename} on ${date}: data - ${gain} - ${totalGain}`, err.message);
      }
    }
  }

  console.log('🎉 All data inserted.');
}

module.exports = {
  readAllCSVFiles,
  saveStatsToDb,
};

if (require.main === module) {
  saveStatsToDb()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error running script:', err);
      process.exit(1);
    });
}
