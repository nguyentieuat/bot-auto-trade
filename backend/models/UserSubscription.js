module.exports = (sequelize, DataTypes) => {
  const UserSubscription = sequelize.define('UserSubscription', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    package_id: { type: DataTypes.INTEGER },
    bot_id: { type: DataTypes.INTEGER },
    price_paid: DataTypes.DECIMAL(12, 2),
    start_at: { type: DataTypes.DATE, allowNull: false },
    end_at: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING(20), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'user_subscriptions',
    timestamps: false,
  });

  UserSubscription.associate = (models) => {
    UserSubscription.belongsTo(models.User, { foreignKey: 'user_id' });
    UserSubscription.belongsTo(models.SubscriptionPackage, { foreignKey: 'package_id' });
    UserSubscription.belongsTo(models.Bot, { foreignKey: 'bot_id' });
  };

  return UserSubscription;
};
