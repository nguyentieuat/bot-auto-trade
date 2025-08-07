const cron = require('node-cron');
const pool = require('../db');
const {truncateDecimal} = require('../utils/utils');

async function updateDailyUserProfits() {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    await client.query('BEGIN');

    // 1. Get system capital & daily gain
    const systemRes = await client.query(`
      SELECT sdc.gain, stc.current_amount
      FROM system_daily_stats sdc
      JOIN system_total_capital stc ON TRUE
      WHERE sdc.date = $1
      LIMIT 1
    `, [today]);

    if (systemRes.rows.length === 0) throw new Error('No system_daily_stats for today');

    const { gain: systemGain, current_amount: systemCapital } = systemRes.rows[0];

    if (systemCapital <= 0 || systemGain == null) {
      console.warn('Skip cron: Invalid system capital or gain');
      await client.query('ROLLBACK');
      return;
    }

    // 2. Get all users with total capital starting today
    const userRes = await client.query(`
      SELECT user_id, SUM(capital_amount) AS user_capital
      FROM investment_orders
      WHERE status = 'starting'
      GROUP BY user_id
    `);

    // 3. For each user, calculate gain and total_gain
    for (const row of userRes.rows) {
      const { user_id, user_capital } = row;

      const gain = truncateDecimal(((user_capital / systemCapital) * systemGain * 0.9), 6);

      // Lấy total_gain hôm trước
      const prevRes = await client.query(`
        SELECT total_gain FROM daily_user_profits
        WHERE user_id = $1 AND date < $2
        ORDER BY date DESC
        LIMIT 1
      `, [user_id, today]);

      const prevTotal = prevRes.rows[0]?.total_gain || 0;
      const total_gain = truncateDecimal((prevTotal + gain),  6);

      await client.query(`
        INSERT INTO daily_user_profits (user_id, date, capital_on_day, gain, total_gain)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, date)
        DO UPDATE SET capital_on_day = EXCLUDED.capital_on_day,
                      gain = EXCLUDED.gain,
                      total_gain = EXCLUDED.total_gain
      `, [user_id, today, user_capital, gain, total_gain]);
    }

    await client.query('COMMIT');
    console.log(`[Cron] Updated daily_user_profits for ${today}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Cron] Error updating daily_user_profits:', error);
  } finally {
    client.release();
  }
}

// Chạy hàng ngày lúc 1:00 sáng
cron.schedule('0 1 * * *', updateDailyUserProfits);

// Cho chạy tay nếu cần
if (require.main === module) updateDailyUserProfits();
