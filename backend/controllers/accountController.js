const { User, UserProfile } = require('../models');
const bcrypt = require('bcrypt');
const pool = require('../db');

exports.updateUserInfoByUsername = async (req, res) => {
    const { username } = req.params;
    const { bank, accountNumber, telegramID, address } = req.body;
    debugger
    try {
        const user = await User.findOne({
            where: { username },
            include: [{ model: UserProfile }],
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.UserProfile) {
            await UserProfile.create({
                user_id: user.id,
                bank: bank,
                bank_account: accountNumber,
                telegram_id: telegramID,
                address: address
            });
        } else {
            user.UserProfile.bank = bank;
            user.UserProfile.bank_account = accountNumber;
            user.UserProfile.telegram_id = telegramID;
            user.UserProfile.address = address;
            await user.UserProfile.save();
        }

        res.json({ message: "Thông tin tài khoản đã được cập nhật.", user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi cập nhật thông tin." });
    }

};

exports.changePasswordByUsername = async (req, res) => {
    const { username } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Mật khẩu cũ không đúng.' });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi đổi mật khẩu.' });
    }
};

exports.getUserProfileByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({
            where: { username },
            include: [{ model: UserProfile }]
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user.UserProfile || {}); // Trả về {} nếu chưa có detail
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server khi lấy thông tin chi tiết." });
    }
};

exports.createInvestment = async (req, res) => {
  try {
    const { username, capital, status } = req.body;

    if (!username || !capital) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    // 1. Tìm user_id và total_capital
    const userResult = await pool.query(
      `SELECT u.id AS user_id, up.total_capital
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.username = $1`,
      [username]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const { user_id, total_capital } = userResult.rows[0];

    if (total_capital === null) {
      return res.status(400).json({ message: "Chưa có số vốn khả dụng" });
    }

    // 2. Tính tổng vốn đã đặt ở trạng thái chưa hoàn tất
    const activeOrders = await pool.query(
      `SELECT COALESCE(SUM(capital_amount), 0) AS total_used
       FROM investment_orders
       WHERE user_id = $1 AND status IN ('pending', 'running')`,
      [user_id]
    );

    const totalUsed = parseFloat(activeOrders.rows[0].total_used);
    const remainingCapital = parseFloat(total_capital) - totalUsed;

    // 3. So sánh
    if (parseFloat(capital) > remainingCapital) {
      return res.status(400).json({
        message: `Số vốn không đủ. Số vốn còn lại: ${remainingCapital}`,
      });
    }

    // 4. Tạo lệnh đầu tư
    const result = await pool.query(
      `INSERT INTO investment_orders (user_id, capital_amount, status, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [user_id, capital, status || 'pending']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi thêm đầu tư:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


exports.getInvestmentOrdersByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT io.*
       FROM investment_orders io
       JOIN users u ON io.user_id = u.id
       WHERE u.username = $1
       ORDER BY io.created_at DESC`,
      [username]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy investment_orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};