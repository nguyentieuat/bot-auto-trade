module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define('Bot', {
    name: { type: DataTypes.STRING(100), allowNull: false },
    name_org: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    status: { type: DataTypes.STRING(20), defaultValue: 'active' },
    risk_level: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'bots',
    timestamps: false,
  });

  Bot.associate = (models) => {
    Bot.hasMany(models.DailyBotStat, { foreignKey: 'bot_id' });
    Bot.hasMany(models.UserSubscription, { foreignKey: 'bot_id' });
  };

  return Bot;
};
