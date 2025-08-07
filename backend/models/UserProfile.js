module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfile', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    full_name: DataTypes.STRING(100),
    address: DataTypes.TEXT,
    note: DataTypes.TEXT,
    bank: DataTypes.STRING(100),
    bank_account: DataTypes.STRING(100),
    telegram_id: DataTypes.STRING(50),
    total_capital: { type: DataTypes.DECIMAL(26, 3) },
  }, {
    tableName: 'user_profiles',
    timestamps: false,
  });

  UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return UserProfile;
};
