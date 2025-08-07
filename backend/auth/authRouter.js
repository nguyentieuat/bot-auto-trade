const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware');

// REGISTER
router.post('/api/register', async (req, res) => {
    const { username, password, email, phone } = req.body;
    try {
        const exists = await pool.query(
            'SELECT * FROM users WHERE username=$1 OR email=$2 OR phone=$3',
            [username, email, phone]
        );
        if (exists.rows.length > 0) {
            return res.status(400).json({ message: 'Tài khoản đã tồn tại!' });
        }

        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password, email, phone) VALUES ($1, $2, $3, $4)',
            [username, hashed, email, phone]
        );
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// LOGIN bằng username OR email OR phone
router.post('/api/login', async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    const { account, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username=$1 OR email=$1 OR phone=$1',
            [account]
        );

        console.log("result", result)
        if (result.rows.length === 0) return res.status(400).json({ message: 'Tài khoản không tồn tại' });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Sai mật khẩu' });

        // Tạo JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        delete user.password;
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});


router.get('/api/profile', authenticateToken, async (req, res) => {
    // req.user chứa { id, username } từ JWT
    const userId = req.user.id;
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    res.json({ user: result.rows[0] });
});

router.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        // req.user được gán từ middleware sau khi verify token
        const { id, email, username } = req.user;
        res.json({ id, email, username });
    } catch (err) {
        console.error('Error in /me:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
