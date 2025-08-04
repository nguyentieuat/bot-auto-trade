module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    password: { type: DataTypes.TEXT, allowNull: false },
    is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'users',
    timestamps: false,
  });

  User.associate = (models) => {
    User.hasOne(models.UserProfile, { foreignKey: 'user_id' });
    User.hasMany(models.InvestmentOrder, { foreignKey: 'user_id' });
    User.hasMany(models.UserSubscription, { foreignKey: 'user_id' });
    User.hasMany(models.WithdrawalRequest, { foreignKey: 'user_id' });
  };

  return User;
};
