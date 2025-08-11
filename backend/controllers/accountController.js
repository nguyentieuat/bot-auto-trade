const { User, UserProfile } = require('../models');
const bcrypt = require('bcrypt');
const pool = require('../db');

const userService = require('../services/userService');

exports.updateUserInfoByUsername = async (req, res) => {
    const { username } = req.params;
    const { bank, accountNumber, address } = req.body;
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
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
                address: address
            });
        } else {
            user.UserProfile.bank = bank;
            user.UserProfile.bank_account = accountNumber;
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
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
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
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
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

exports.getUserInfoByUsername = async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
    try {
        const user = await User.findOne({
            where: { username },
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user || {}); // Trả về {} nếu chưa có detail
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
        const user = await userService.getTotalCaptitalByUsername(username);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const { user_id, total_capital } = user;

        if (total_capital === null) {
            return res.status(400).json({ message: "Chưa có số vốn khả dụng" });
        }

        // 2. So sánh
        if (parseFloat(capital) > parseFloat(total_capital)) {
            return res.status(400).json({
                message: `Số vốn không đủ. Số vốn còn lại: ${remainingCapital}`,
            });
        }

        // 3. Tạo lệnh đầu tư
        const newOrder = await userService.createInvestmentOrder(
            user_id,
            capital,
            status
        );

        // 4. Trừ total_capital của user_profile
        const remainingCapital = parseFloat(total_capital) - parseFloat(capital);
        await userService.updateTotalCapital(user_id, remainingCapital);

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Lỗi khi thêm đầu tư:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getInvestmentOrdersByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const orders = await userService.getInvestmentOrdersByUsername(username);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Lỗi khi lấy investment_orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getSubscriptionByUsernameAndBotName = async (req, res) => {
    const { username, botName } = req.params;

    if (!username || !botName) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    try {
        const subscription = await userService.getSubscriptionByUsernameAndBotName(username, botName);

        if (!subscription) {
            return res.status(403).json({ message: "Bạn chưa đăng ký hoặc gói đã hết hạn" });
        }

        res.status(200).json(subscription);
    } catch (error) {
        console.error('Lỗi khi lấy subscription:', error);

        if (error.message === 'UserNotFound') {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        if (error.message === 'BotNotFound') {
            return res.status(404).json({ message: "Không tìm thấy bot" });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTotalCaptitalByUsername = async (req, res) => {

    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    try {
        const orders = await userService.getTotalCaptitalByUsername(username);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Lỗi khi lấy investment_orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

exports.getUserInvestmentSummary = async (req, res) => {

    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    try {
        const investmentSummaryrs = await userService.getUserInvestmentSummary(username);
        res.status(200).json(investmentSummaryrs);
    } catch (error) {
        console.error('Lỗi khi lấy Investment Summaryrs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

exports.getUserProfits = async (req, res) => {

    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    try {
        const investmentSummaryrs = await userService.getUserProfits(username);
        res.status(200).json(investmentSummaryrs);
    } catch (error) {
        console.error('Lỗi khi lấy User Profits:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

exports.getUserBotSubcribedGains = async (req, res) => {

    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    try {
        const investmentSummaryrs = await userService.getUserBotSubcribedGains(username);
        res.status(200).json(investmentSummaryrs);
    } catch (error) {
        console.error('Lỗi khi lấy User Profits:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};