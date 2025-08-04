const botService = require('../services/botService');

exports.getActiveBots = async (req, res) => {
  try {
    const bots = await botService.getActiveBots();
    res.json(bots);
  } catch (error) {
    console.error('Lỗi khi lấy bot:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bot' });
  }
};

