module.exports = (sequelize, DataTypes) => {
  const SubscriptionPackage = sequelize.define('SubscriptionPackage', {
    name: DataTypes.STRING(100),
    level: { type: DataTypes.INTEGER, validate: { min: 1 } },
    duration_months: { type: DataTypes.INTEGER, validate: { isIn: [[1, 3, 6, 12]] } },
    base_price: DataTypes.DECIMAL(10, 2),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'subscription_packages',
    timestamps: false,
  });

  SubscriptionPackage.associate = (models) => {
    SubscriptionPackage.hasMany(models.UserSubscription, { foreignKey: 'package_id' });
  };

  return SubscriptionPackage;
};
