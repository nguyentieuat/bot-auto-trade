module.exports = (sequelize, DataTypes) => {
  const BotChannel = sequelize.define('BotChannel', {
    bot_id: { type: DataTypes.INTEGER, allowNull: false },
    channel_link_free: { type: DataTypes.STRING(255), allowNull: false },
    channel_link_pre: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.STRING(20), defaultValue: 'active' },
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
