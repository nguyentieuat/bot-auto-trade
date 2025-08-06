const pool = require('../db');
const userService = require('../services/userService');

exports.getSystemBankInfo = async () => {
    const query = 'SELECT * FROM system_bank_account LIMIT 1';

    const result = await pool.query(query);

    return result.rows[0];
};

exports.depositBankUser = async (username, amount) => {
    try {
        const userResult = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return { error: 'User not found' };
        }

        const userId = userResult.rows[0].id;

        const insertResult = await pool.query(
            `INSERT INTO deposit_requests 
       (user_id, amount, method, status) 
       VALUES ($1, $2, 'bank_transfer', 'pending') 
       RETURNING *`,
            [userId, amount]
        );

        return {
            message: 'Deposit request submitted successfully',
            deposit: insertResult.rows[0],
        };

    } catch (error) {
        console.error('Error submitting deposit request:', error);
        throw error;  // để controller bắt lỗi
    }
};

exports.depositHistoryUser = async (username) => {
    try {
        // Truy vấn lấy lịch sử nạp của user dựa vào username
        const result = await pool.query(`
            SELECT dr.id, dr.amount, dr.requested_at, dr.confirmed_at, dr.status, dr.method, dr.transaction_id, dr.note
            FROM deposit_requests dr
            JOIN users u ON dr.user_id = u.id
            WHERE u.username = $1
            ORDER BY dr.requested_at DESC
        `, [username]);

        // Nếu không có bản ghi nào
        if (result.rows.length === 0) {
            return { error: 'No deposit history found for this user.' };
        }

        return { deposits: result.rows };
    } catch (err) {
        console.error('Error fetching deposit history:', err);
        throw err;
    }
};

exports.withdrawBankUser = async (username, amount) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lấy user_id
        const user = await userService.findUserByUsername(username);
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }

        if (parseFloat(user.total_capital) < parseFloat(amount)) {
            throw new Error('Số dư không đủ để yêu cầu rút tiền');
        }

        // Thêm yêu cầu rút tiền
        await client.query(
            `INSERT INTO withdrawal_requests (user_id, amount, requested_at, status)
             VALUES ($1, $2, NOW(), 'pending')`,
            [user.user_id, amount]
        );

        await client.query('COMMIT');
        return { success: true, message: 'Yêu cầu rút tiền đã được gửi thành công' };

    } catch (error) {
        await client.query('ROLLBACK');
        return { success: false, message: error.message };
    } finally {
        client.release();
    }
};

exports.withdrawHistoryUser = async (username) => {
    try {
        const query = `
      SELECT wr.id, wr.amount, wr.requested_at, wr.confirmed_at, wr.status, wr.note,
             up.bank, up.bank_account
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.username = $1
      ORDER BY wr.requested_at DESC
    `;

        const result = await pool.query(query, [username]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        throw new Error('Unable to fetch withdrawal history.');
    }
};