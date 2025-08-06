const { Bot, BotChannel } = require('../models');
const pool = require('../db');

exports.getActiveBots = async () => {
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

module.exports = {
    getBotChannels,
    // các hàm khác nếu có...
};