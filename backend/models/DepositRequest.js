module.exports = (sequelize, DataTypes) => {
  const DepositRequest = sequelize.define('DepositRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(22, 2), allowNull: false },
    requested_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    confirmed_at: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
    method: { type: DataTypes.STRING(50) },
    transaction_id: { type: DataTypes.STRING(255) },
    note: { type: DataTypes.TEXT }
  }, {
    tableName: 'deposit_requests',
    timestamps: false
  });

  DepositRequest.associate = function(models) {
    DepositRequest.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return DepositRequest;
};
