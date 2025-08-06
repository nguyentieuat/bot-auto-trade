const systemBankService = require('../services/systemBankService');

exports.getSystemBankInfo = async (req, res) => {

    try {
        const systemBankInfo = await systemBankService.getSystemBankInfo();
        res.status(200).json(systemBankInfo);
    } catch (error) {
        console.error('Lỗi khi lấy system_bank_account:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.depositBankUser = async (req, res) => {
    const { username } = req.params;
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid or missing amount.' });
    }
    try {
        const result = await systemBankService.depositBankUser(username, amount);

        if (result.error) {
            return res.status(404).json({ message: result.error });
        }

        res.status(201).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.depositHistoryUser = async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: 'Invalid or missing username.' });
    }
    try {
        const result = await systemBankService.depositHistoryUser(username);

        if (result.error) {
            return res.status(404).json({ message: result.error });
        }

        res.status(201).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.withdrawBankUser = async (req, res) => {
    const { username } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Số tiền không hợp lệ hoặc bị thiếu.' });
    }

    try {
        const result = await systemBankService.withdrawBankUser(username, amount);
        if (!result.success) {
            return res.status(400).json({ message: result.message }); 
        }

        res.status(201).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

exports.withdrawHistoryUser = async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: 'Invalid or missing username.' });
    }
    try {
        const result = await systemBankService.withdrawHistoryUser(username);

        if (result.error) {
            return res.status(404).json({ message: result.error });
        }

        res.status(201).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};