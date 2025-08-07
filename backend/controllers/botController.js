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

exports.getBotChanelsByBotName = async (req, res) => {
  const { botName } = req.params;
  try {
    const channel = await botService.getBotChannels(botName);
    res.status(200).json(channel);
  } catch (error) {
    console.error('Lỗi khi lấy bot:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bot' });
  }
};

exports.getAllSubscriptionBot = async (req, res) => {
  const { botName } = req.params;
  try {
    const channel = await botService.getAllSubscriptionBot(botName);
    res.status(200).json(channel);
  } catch (error) {
    console.error('Lỗi khi lấy bot:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bot' });
  }
};