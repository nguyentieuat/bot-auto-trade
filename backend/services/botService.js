const { Bot } = require('../models');
const pool = require('../db');

exports.getActiveBots = async () => {
  return await Bot.findAll({
    where: { status: 'active' },
    order: [['created_at', 'DESC']],
  });
};