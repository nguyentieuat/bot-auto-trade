/**
 * Sequelize model for `system_bank_account` table
 */

module.exports = (sequelize, DataTypes) => {
  const SystemBankAccount = sequelize.define('SystemBankAccount', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bank_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    account_number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    account_holder: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'system_bank_account',
    timestamps: false
  });

  return SystemBankAccount;
};
