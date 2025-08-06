const pool = require('../db');

/** Tìm user theo username */
async function findUserByUsername(username) {
    const result = await pool.query(
        `SELECT u.id AS user_id, up.total_capital
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.username = $1`,
        [username]
    );
    return result.rows[0] || null;
}

/** Lấy tổng vốn đã đầu tư ở trạng thái pending/running */
async function getTotalUsedCapital(userId) {
    const result = await pool.query(
        `SELECT COALESCE(SUM(capital_amount), 0) AS total_used
         FROM investment_orders
         WHERE user_id = $1 AND status IN ('pending', 'running')`,
        [userId]
    );
    return parseFloat(result.rows[0].total_used);
}

/** Tạo lệnh đầu tư */
async function createInvestmentOrder(userId, capital, status = 'pending') {
    const result = await pool.query(
        `INSERT INTO investment_orders (user_id, capital_amount, status, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [userId, capital, status]
    );
    return result.rows[0];
}

/** Lấy danh sách lệnh đầu tư theo username */
async function getInvestmentOrdersByUsername(username) {
    const result = await pool.query(
        `SELECT io.*
         FROM investment_orders io
         JOIN users u ON io.user_id = u.id
         WHERE u.username = $1
         ORDER BY io.created_at DESC`,
        [username]
    );
    return result.rows;
}

/**
 * Lấy thông tin đăng ký bot của user theo username + botName, có kiểm tra còn hạn sử dụng
 * @param {string} username
 * @param {string} botName
 * @returns {Promise<Object|null>} Trả về thông tin subscription nếu còn hạn, ngược lại null
 */
async function getSubscriptionByUsernameAndBotName(username, botName) {
    // 1. Lấy user_id
    const userResult = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    if (userResult.rowCount === 0) throw new Error("UserNotFound");
    const user_id = userResult.rows[0].id;

    // 2. Lấy bot_id
    const botResult = await pool.query(
        `SELECT id FROM bots WHERE name = $1 AND status = 'active'`,
        [botName]
    );
    if (botResult.rowCount === 0) throw new Error("BotNotFound");
    const bot_id = botResult.rows[0].id;

    // 3. Truy vấn subscription còn thời hạn
    const result = await pool.query(
        `SELECT *
         FROM user_subscriptions
         WHERE user_id = $1
           AND bot_id = $2
           AND (end_at IS NULL OR end_at > NOW())`,
        [user_id, bot_id]
    );

    // Trả về subscription còn hạn, hoặc null nếu hết hạn
    return result.rows[0] || null;
}


async function updateTotalCapital(user_id, newCapital) {
    return pool.query(
        `UPDATE user_profiles SET total_capital = $1 WHERE user_id = $2`,
        [newCapital, user_id]
    );
}

module.exports = {
    findUserByUsername,
    getTotalUsedCapital,
    createInvestmentOrder,
    getInvestmentOrdersByUsername,
    getSubscriptionByUsernameAndBotName,
    updateTotalCapital
};
