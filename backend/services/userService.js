const pool = require('../db');

/** Tìm user theo username */
async function getTotalCaptitalByUsername(username) {
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
        `SELECT 
            us.*, 
            usb.*, 
            b.name AS bot_name
        FROM user_subscriptions us
        JOIN user_subscription_bots usb ON us.id = usb.subscription_id
        JOIN bots b ON usb.bot_id = b.id
        WHERE us.user_id = $1
            AND usb.bot_id = $2
            AND us.end_date > NOW()`,
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
async function getUserInvestmentSummary(username) {
    // 1. Lấy user_id
    const userResult = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    if (userResult.rowCount === 0) throw new Error("UserNotFound");
    const user_id = userResult.rows[0].id;

    // 2. Truy vấn subscription còn thời hạn
    const result = await pool.query(
        `SELECT 
            u.id AS user_id,
            u.username,
            up.total_capital AS remaining_capital,

            -- Tổng theo status
            COALESCE(SUM(CASE WHEN io.status = 'pending' THEN io.capital_amount ELSE 0 END), 0) AS total_pending,
            COALESCE(SUM(CASE WHEN io.status = 'confirmed' THEN io.capital_amount ELSE 0 END), 0) AS total_confirmed,
            COALESCE(SUM(CASE WHEN io.status = 'starting' THEN io.capital_amount ELSE 0 END), 0) AS total_starting

        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN investment_orders io 
        ON u.id = io.user_id AND io.status != 'rejected'

        WHERE u.id = $1

        GROUP BY u.id, u.username, up.total_capital;`,
        [user_id]
    );

    // Trả về tiền còn lại của user, số tiền đã đầu tư theo từng status
    return result.rows[0] || null;
}

async function getUserProfits(username) {
    // 1. Lấy user_id
    const userResult = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    if (userResult.rowCount === 0) throw new Error("UserNotFound");
    const user_id = userResult.rows[0].id;

    const result = await pool.query(
        `SELECT date, gain, total_gain
       FROM daily_user_profits
       WHERE user_id = $1
       ORDER BY date ASC`,
        [user_id]
    );

    const data = result.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        gain: parseFloat(row.gain),
        total_gain: parseFloat(row.total_gain)
    }));
    return { userId: user_id, data };
}

async function getUserBotSubcribedGains(username) {
    const userResult = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    if (userResult.rowCount === 0) throw new Error("UserNotFound");
    const user_id = userResult.rows[0].id;

    // 1. Lấy danh sách các bot mà người dùng đã đăng ký + ngày bắt đầu
    const botsResult = await pool.query(`
                                        SELECT
                                            b.id AS bot_id,
                                            b.name,
                                            us.start_date
                                        FROM user_subscriptions us
                                        JOIN user_subscription_bots usb ON us.id = usb.subscription_id
                                        JOIN bots b ON b.id = usb.bot_id
                                        WHERE us.user_id = $1
                                        `, [user_id]);

    const bots = botsResult.rows;
    if (bots.length === 0) return [];

    // 2. Tạo VALUES string để join bot_id + start_date
    const valuesList = bots
        .map((b, i) => `($${i * 2 + 1}::int, $${i * 2 + 2}::date)`)
        .join(', ');
    const valuesParams = bots.flatMap(b => [b.bot_id, b.start_date]);

    // 3. Lấy stats đã lọc từ SQL
    const statsResult = await pool.query(`
                                        WITH bot_start_dates(bot_id, start_date) AS (
                                            VALUES ${valuesList}
                                        )
                                        SELECT s.bot_id, s.date, s.gain
                                        FROM daily_bot_stats s
                                        JOIN bot_start_dates bsd ON s.bot_id = bsd.bot_id
                                        WHERE s.date >= bsd.start_date
                                        ORDER BY s.bot_id, s.date
                                        `, valuesParams);

    // 4. Group stats theo bot_id
    const statsMap = {};
    for (const row of statsResult.rows) {
        if (!statsMap[row.bot_id]) statsMap[row.bot_id] = [];
        statsMap[row.bot_id].push({
            date: row.date,
            gain: parseFloat(row.gain),
        });
    }

    // 5. Kết hợp với thông tin bot ban đầu để ra kết quả cuối
    const result = bots.map(bot => ({
        bot_id: bot.bot_id,
        name: bot.name,
        start_date: bot.start_date,
        daily_stats: statsMap[bot.bot_id] || [],
    }));

    return result;
}

module.exports = {
    getTotalCaptitalByUsername,
    getTotalUsedCapital,
    createInvestmentOrder,
    getInvestmentOrdersByUsername,
    getSubscriptionByUsernameAndBotName,
    updateTotalCapital,
    getUserInvestmentSummary,
    getUserProfits,
    getUserBotSubcribedGains
};
