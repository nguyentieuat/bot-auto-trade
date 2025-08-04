module.exports = (sequelize, DataTypes) => {
  const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(22, 2), allowNull: false },
    requested_at: { type: DataTypes.DATE, allowNull: false },
    confirmed_at: DataTypes.DATE,
    status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
    note: DataTypes.TEXT,
  }, {
    tableName: 'withdrawal_requests',
    timestamps: false,
  });

  WithdrawalRequest.associate = (models) => {
    WithdrawalRequest.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return WithdrawalRequest;
};
