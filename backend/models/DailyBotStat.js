module.exports = (sequelize, DataTypes) => {
  const DailyBotStat = sequelize.define('DailyBotStat', {
    bot_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    gain: DataTypes.DECIMAL(12, 6),
    total_gain: DataTypes.DECIMAL(12, 6),
  }, {
    tableName: 'daily_bot_stats',
    timestamps: false,
    indexes: [{ unique: true, fields: ['bot_id', 'date'] }],
  });

  DailyBotStat.associate = (models) => {
    DailyBotStat.belongsTo(models.Bot, { foreignKey: 'bot_id' });
  };

  return DailyBotStat;
};
