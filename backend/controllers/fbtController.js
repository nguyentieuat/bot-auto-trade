const { getCache, setCache } = require('../services/cacheService');
const { Bot } = require('../models');
const pool = require('../db');

async function getAllActiveBotStats(req, res) {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    // Dùng cache nếu có
    let grouped = getCache('active_bot_stats');

    if (!grouped) {
      const activeBots = await Bot.findAll({ where: { status: 'active' } });
      const botIds = activeBots.map(bot => bot.id);
      const botNames = Object.fromEntries(activeBots.map(bot => [bot.id, bot.name]));

      const { rows } = await pool.query(`
        SELECT * FROM daily_bot_stats
        WHERE bot_id = ANY($1)
        ORDER BY date ASC
      `, [botIds]);

      grouped = {};
      rows.forEach((row) => {
        const name = botNames[row.bot_id] || 'Unknown';
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(row);
      });

      setCache('active_bot_stats', grouped);
    }

    // Lấy mảng botName
    const allBotNames = Object.keys(grouped);
    const pagedBotNames = allBotNames.slice(offset, offset + limit);
    const pagedGrouped = Object.fromEntries(
      pagedBotNames.map((name) => [name, grouped[name]])
    );

    res.json({
      hasMore: offset + limit < allBotNames.length,
      bots: pagedGrouped
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bot stats' });
  }
}


module.exports = {
  getAllActiveBotStats
};