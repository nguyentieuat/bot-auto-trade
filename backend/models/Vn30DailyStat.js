module.exports = (sequelize, DataTypes) => {
  const Vn30DailyStat = sequelize.define('Vn30DailyStat', {
    date: { type: DataTypes.DATEONLY, unique: true, allowNull: false },
    gain: DataTypes.DECIMAL(12, 6),
    total_gain: DataTypes.DECIMAL(12, 6),
  }, {
    tableName: 'vn30_daily_stats',
    timestamps: false,
  });

  return Vn30DailyStat;
};
