const { Bot, BotChannel } = require('../models');
const pool = require('../db');

/**
 * Lấy danh sách tất cả bot 
 */
async function getActiveBots () {
    return await Bot.findAll({
        where: { status: 'active' },
        order: [['created_at', 'DESC']],
    });
};

/**
 * Lấy danh sách tất cả channel của bot theo tên bot
 * @param {string} botName
 * @returns {Promise<Array>} Mảng các channel
 */
async function getBotChannels(botName) {
    try {
        const result = await pool.query(
            `SELECT bc.*
             FROM bot_channels bc
             JOIN bots b ON bc.bot_id = b.id
             WHERE b.name = $1 AND b.status ='active'`,
            [botName]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error in getBotChannels:', error);
        throw error;
    }
}

async function getAllSubscriptionBot(botName) {
    const query = `
    SELECT 
      td.months,
      brp.base_price_per_month AS base_price,
      td.discount_multiplier,
      ROUND(brp.base_price_per_month * td.months * td.discount_multiplier, 2) AS final_price
    FROM bots b
    JOIN bot_risk_prices brp ON b.risk_level = brp.risk_level
    JOIN time_discounts td ON TRUE
    WHERE b.name = $1
    ORDER BY td.months;
  `;

    const result = await pool.query(query, [botName]);
    return result.rows;
}



module.exports = {
    getActiveBots,
    getBotChannels,
    getAllSubscriptionBot
    // các hàm khác nếu có...
};