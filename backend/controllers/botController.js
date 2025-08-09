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
  if (!botName) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
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
  if (!botName) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
  try {
    const channel = await botService.getAllSubscriptionBot(botName);
    res.status(200).json(channel);
  } catch (error) {
    console.error('Lỗi khi lấy bot:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bot' });
  }
};

exports.getBotWithStats= async (req, res) => {
  const { botName } = req.params;
  if (!botName) {
        return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }
  try {
    const rows = await botService.getBotWithStats(botName);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bot not found' });
    }

    const { name, description, risk_level } = rows[0];

    const data = rows.map(row => ({
      date: row.date,
      gain: parseFloat(row.gain),
      total_gain: parseFloat(row.total_gain)
    }));

    return res.json({
      bot: {
        name,
        description,
        risk_level,
        data
      }
    });
  } catch (err) {
    console.error('Lỗi khi lấy bot:', err);
    res.status(500).json({ message: 'Server error' });
  }
};