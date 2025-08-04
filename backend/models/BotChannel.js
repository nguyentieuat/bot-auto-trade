module.exports = (sequelize, DataTypes) => {
  const BotChannel = sequelize.define('BotChannel', {
    bot_id: { type: DataTypes.INTEGER, allowNull: false },
    channel_link: { type: DataTypes.STRING(255), allowNull: false },
    is_premium: { type: DataTypes.BOOLEAN, defaultValue: false },
    note: DataTypes.TEXT,
  }, {
    tableName: 'bot_channels',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['bot_id', 'is_premium']
      }
    ]
  });

  BotChannel.associate = (models) => {
    BotChannel.belongsTo(models.Bot, { foreignKey: 'bot_id' });
  };

  return BotChannel;
};
