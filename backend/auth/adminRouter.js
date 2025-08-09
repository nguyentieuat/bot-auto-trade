const express = require('express');
const router = express.Router();
const pool = require('../db');
require('dotenv').config();
const authenticateTokenAdmin = require('./authMiddlewareAdmin');

router.get('/api/admin/deposits', authenticateTokenAdmin, async (req, res) => {
    try {
        const deposits = await pool.query(`
      SELECT dr.*, u.username
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.status = 'pending'
      ORDER BY dr.requested_at DESC
    `);
        res.json(deposits.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nạp tiền' });
    }
});

router.get('/api/admin/withdrawals', authenticateTokenAdmin, async (req, res) => {
    try {
        const withdrawals = await pool.query(`
      SELECT wr.*, u.username
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      WHERE wr.status = 'pending'
      ORDER BY wr.requested_at DESC
    `);
        res.json(withdrawals.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách rút tiền' });
    }
});

// routes: /api/admin/deposits/:id/approve
router.post('/api/admin/deposits/:id/approve', authenticateTokenAdmin, async (req, res) => {
    const id = req.params.id;

    try {
        // 1. Cập nhật trạng thái deposit
        const updateResult = await pool.query(
            `UPDATE deposit_requests 
       SET status = 'confirmed', confirmed_at = NOW() 
       WHERE id = $1 AND status = 'pending' 
       RETURNING user_id, amount`,
            [id]
        );

        if (updateResult.rowCount === 0) {
            return res.status(400).json({ message: 'Deposit not found or already processed' });
        }

        const { user_id, amount } = updateResult.rows[0];

        // 2. Cộng vào total_capital trong user_profiles
        await pool.query(
            `UPDATE user_profiles 
       SET total_capital = COALESCE(total_capital, 0) + $1 
       WHERE user_id = $2`,
            [amount, user_id]
        );

        res.json({ message: 'Deposit approved and capital updated' });
    } catch (err) {
        console.error('Approve deposit error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/api/admin/deposits/:id/reject', authenticateTokenAdmin, async (req, res) => {
    const id = req.params.id;
    await pool.query(`UPDATE deposit_requests SET status='rejected', confirmed_at=NOW() WHERE id=$1`, [id]);
    res.json({ message: 'Deposit rejected' });
});

router.post('/api/admin/withdrawals/:id/approve', authenticateTokenAdmin, async (req, res) => {
    const client = await pool.connect();
    const withdrawalId = req.params.id;

    try {
        await client.query('BEGIN');

        // 1. Lấy thông tin yêu cầu rút
        const result = await client.query(`
      SELECT wr.*, u.id as user_id
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      WHERE wr.id = $1
      FOR UPDATE
    `, [withdrawalId]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Yêu cầu rút tiền không tồn tại' });
        }

        const withdrawal = result.rows[0];

        if (withdrawal.status !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Yêu cầu đã được xử lý trước đó' });
        }

        // 2. Trừ tiền trong user_profiles
        await client.query(`
      UPDATE user_profiles
      SET total_capital = total_capital - $1
      WHERE user_id = $2
    `, [withdrawal.amount, withdrawal.user_id]);

        // 3. Cập nhật trạng thái yêu cầu rút tiền
        await client.query(`
      UPDATE withdrawal_requests
      SET status = 'confirmed', confirmed_at = NOW()
      WHERE id = $1
    `, [withdrawalId]);

        await client.query('COMMIT');
        res.json({ message: 'Withdrawal approved và đã cập nhật số dư' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xác nhận rút tiền' });
    } finally {
        client.release();
    }
});


router.post('/api/admin/withdrawals/:id/reject', authenticateTokenAdmin, async (req, res) => {
    const id = req.params.id;
    await pool.query(`UPDATE withdrawal_requests SET status='rejected', confirmed_at=NOW() WHERE id=$1`, [id]);
    res.json({ message: 'Withdrawal rejected' });
});

router.get('/api/admin/investment-orders', authenticateTokenAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, username = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = 'WHERE 1=1';

        if (username) {
            params.push(`%${username}%`);
            whereClause += ` AND u.username ILIKE $${params.length}`;
        }

        if (status) {
            params.push(status);
            whereClause += ` AND io.status = $${params.length}`;
        }

        // Query total count
        const totalRes = await pool.query(
            `SELECT COUNT(*) FROM investment_orders io JOIN users u ON u.id = io.user_id ${whereClause}`,
            params
        );
        const total = parseInt(totalRes.rows[0].count);

        // Query data with pagination
        params.push(limit, offset); // $n+1, $n+2
        const dataRes = await pool.query(
            `
            SELECT io.*, u.username
            FROM investment_orders io
            JOIN users u ON u.id = io.user_id
            ${whereClause}
            ORDER BY io.created_at DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
            `,
            params
        );

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/api/admin/investment-orders/:id', authenticateTokenAdmin, async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        let query;
        let params = [id];

        switch (action) {
            case 'confirm':
                query = `UPDATE investment_orders SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1`;
                break;
            case 'reject':
                query = `
                    WITH updated_order AS (
                        UPDATE investment_orders
                        SET status = 'rejected'
                        WHERE id = $1
                        RETURNING user_id, capital_amount
                    )
                    UPDATE user_profiles
                    SET total_capital = total_capital + updated_order.capital_amount
                    FROM updated_order
                    WHERE user_profiles.user_id = updated_order.user_id
                `;
                break;
            case 'start':
                query = `WITH updated_order AS (
                            UPDATE investment_orders
                            SET 
                                start_at = NOW(),
                                status = 'starting'
                            WHERE id = $1 AND status = 'confirmed' AND start_at IS NULL
                            RETURNING capital_amount
                            )
                            UPDATE system_total_capital
                            SET 
                            current_amount = current_amount + updated_order.capital_amount,
                            updated_at = NOW()
                            FROM updated_order`;
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        const result = await pool.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Order not found or condition not met' });
        }

        res.json({ success: true, message: `${action} action applied` });
    } catch (err) {
        console.error('Action failed:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/api/admin/guest-join-requests', authenticateTokenAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Đếm tổng số bản ghi
        const countResult = await pool.query('SELECT COUNT(*) FROM guest_join_requests');
        const total = parseInt(countResult.rows[0].count);

        // Lấy dữ liệu với phân trang
        const result = await pool.query(`
            SELECT * FROM guest_join_requests
            ORDER BY submitted_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const requests = result.rows;

        // Lấy toàn bộ bots
        const botResult = await pool.query(`SELECT id, name FROM bots`);
        const botMap = {};
        botResult.rows.forEach(bot => {
            botMap[bot.id] = bot.name;
        });

        // Gắn tên bot
        const enrichedRequests = requests.map((r) => ({
            ...r,
            selected_bot_names: Array.isArray(r.selected_bot_ids)
                ? r.selected_bot_ids.map(id => botMap[id] || `Bot #${id}`)
                : [],
        }));

        res.json({
            data: enrichedRequests,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Lỗi khi lấy guest_join_requests:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Tổng hợp theo bot
router.get('/api/admin/analytics/bot-sales', authenticateTokenAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        b.id,
        b.name,
        COUNT(usb.id) AS subscriptions_count,
        COALESCE(SUM(usb.price), 0) AS total_revenue
      FROM bots b
      LEFT JOIN user_subscription_bots usb ON b.id = usb.bot_id
      GROUP BY b.id, b.name
      ORDER BY total_revenue DESC
    `);
        res.json(result);
    } catch (err) {
        console.error('Error getBotSalesStats', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Tổng hợp theo gói
router.get('/api/admin/analytics/package-sales', authenticateTokenAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        package_name,
        COUNT(*) AS subscriptions_count,
        SUM(total_price) AS total_revenue
      FROM user_subscriptions
      GROUP BY package_name
      ORDER BY total_revenue DESC
    `);
        res.json(result);
    } catch (err) {
        console.error('Error getPackageSalesStats', err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;