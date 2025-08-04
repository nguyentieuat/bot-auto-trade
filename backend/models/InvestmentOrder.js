module.exports = (sequelize, DataTypes) => {
  const InvestmentOrder = sequelize.define('InvestmentOrder', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    capital_amount: { type: DataTypes.DECIMAL(23, 3), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    start_at: DataTypes.DATE,
    confirmed_at: DataTypes.DATE,
    end_date: DataTypes.DATE,
    status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
    note: DataTypes.TEXT,
  }, {
    tableName: 'investment_orders',
    timestamps: false,
  });

  InvestmentOrder.associate = (models) => {
    InvestmentOrder.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return InvestmentOrder;
};
