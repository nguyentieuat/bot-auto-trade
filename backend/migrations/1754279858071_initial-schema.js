/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(20)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    phone: { type: 'varchar(20)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    is_admin: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createTable('user_profiles', {
    user_id: {
      type: 'integer',
      primaryKey: true,
      references: 'users',
      onDelete: 'cascade',
    },
    full_name: { type: 'varchar(100)' },
    address: { type: 'text' },
    note: { type: 'text' },
    bank: { type: 'varchar(100)' },
    bank_account: { type: 'varchar(100)' },
    telegram_id: { type: 'varchar(50)' },
    total_capital: { type: 'numeric(26, 3)'}
  });

  pgm.createTable('bots', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    name_display: { type: 'varchar(100)', notNull: true },
    description: { type: 'text' },
    status: { type: 'varchar(20)', default: 'active' },
    risk_level: { type: 'int', default: 1, check: 'risk_level >= 1 AND risk_level <= 5' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createTable('bot_channels', {
    id: 'id',
    bot_id: { type: 'int', notNull: true, references: 'bots', onDelete: 'cascade' },
    channel_link: { type: 'varchar(255)', notNull: true },
    is_premium: { type: 'boolean', default: false }, // false = free, true = premium
    note: { type: 'text' }, // Ghi chú (nếu cần)
  });
  pgm.addConstraint('bot_channels', 'unique_bot_channel_type', 'UNIQUE(bot_id, is_premium)');

  pgm.createTable('daily_bot_stats', {
    id: 'id',
    bot_id: { type: 'int', notNull: true, references: 'bots', onDelete: 'cascade' },
    date: { type: 'date', notNull: true },
    gain: { type: 'numeric(12, 6)' },
    total_gain: { type: 'numeric(26, 6)' },
  });
  pgm.addConstraint('daily_bot_stats', 'unique_bot_date', 'UNIQUE(bot_id, date)');

  pgm.createTable('vn30_daily_stats', {
    id: 'id',
    date: { type: 'date', notNull: true, unique: true },
    gain: { type: 'numeric(12, 6)' },
    total_gain: { type: 'numeric(26, 6)' },
  });

  pgm.createTable('investment_orders', {
    id: 'id',
    user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
    capital_amount: { type: 'numeric(23, 3)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    start_at: { type: 'timestamp' },
    confirmed_at: { type: 'timestamp' },
    end_date: { type: 'timestamp' },
    status: { type: 'varchar(20)', default: 'pending' },
    note: { type: 'text' },
  });

  pgm.createTable('subscription_packages', {
    id: 'id',
    name: { type: 'varchar(100)' },
    level: { type: 'int', check: 'level >= 1' },
    duration_months: { type: 'int', check: 'duration_months IN (1, 3, 6, 12)' },
    base_price: { type: 'numeric(10, 3)' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createTable('user_subscriptions', {
    id: 'id',
    user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
    package_id: { type: 'int', references: 'subscription_packages' },
    bot_id: { type: 'int', references: 'bots' },
    price_paid: { type: 'numeric(12, 2)' },
    start_at: { type: 'timestamp', notNull: true },
    end_at: { type: 'timestamp', notNull: true },
    status: { type: 'varchar(20)', default: 'active' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createTable('withdrawal_requests', {
    id: 'id',
    user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
    amount: { type: 'numeric(22, 2)', notNull: true },
    requested_at: { type: 'timestamp', notNull: true },
    confirmed_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', default: 'pending' },
    note: { type: 'text' },
  });

  pgm.createTable('deposit_requests', {
  id: 'id',
  user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
  amount: { type: 'numeric(22, 2)', notNull: true },
  requested_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  confirmed_at: { type: 'timestamp' },
  status: { type: 'varchar(20)', default: 'pending' },  // 'pending', 'confirmed', 'failed'
  method: { type: 'varchar(50)', default: 'bank_transfer'}, // 'bank_transfer', 'usdt', 'momo', etc.
  transaction_id: { type: 'varchar(255)' }, // optional TXID nếu có
  note: { type: 'text' },
});
};

exports.down = (pgm) => {
  pgm.dropTable('deposit_requests');
  pgm.dropTable('withdrawal_requests');
  pgm.dropTable('user_subscriptions');
  pgm.dropTable('subscription_packages');
  pgm.dropTable('investment_orders');
  pgm.dropTable('vn30_daily_stats');
  pgm.dropTable('daily_bot_stats');
  pgm.dropTable('bot_channels');
  pgm.dropTable('bots');
  pgm.dropTable('user_profiles');
  pgm.dropTable('users');
};
