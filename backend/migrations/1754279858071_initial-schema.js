/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // === USERS ===
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(20)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    phone: { type: 'varchar(20)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    is_admin: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  // === USER PROFILES (Thông tin mở rộng) ===
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
    total_capital: { type: 'numeric(26, 3)' },
  });

  // === BOTS ===
  pgm.createTable('bots', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true, unique: true },
    name_org: { type: 'varchar(100)', notNull: true },
    description: { type: 'text' },
    status: { type: 'varchar(20)', default: 'active' },
    risk_level: { type: 'int', default: 1, check: 'risk_level >= 1 AND risk_level <= 5' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  // === Kênh tín hiệu của bot ===
  pgm.createTable('bot_channels', {
    id: 'id',
    bot_id: { type: 'int', notNull: true, references: 'bots', onDelete: 'cascade' },
    channel_link_free: { type: 'varchar(255)' },
    channel_link_pre: { type: 'varchar(255)' },
    status: { type: 'varchar(20)', default: 'active' },
    note: { type: 'text' },
  });

  // === Giá bot theo risk level ===
  pgm.createTable('bot_risk_prices', {
    id: 'id',
    risk_level: { type: 'int', notNull: true, unique: true, check: 'risk_level >= 1 AND risk_level <= 5' },
    base_price_per_month: { type: 'numeric(12, 3)', notNull: true },
  });

  // === Bảng giảm giá theo gói ===
  pgm.createTable('package_discounts', {
    package_name: { type: 'text', primaryKey: true }, // Basic, Silver, Gold, Premium
    max_bots: { type: 'integer', notNull: true },
    discount_multiplier: { type: 'numeric', notNull: true }, // 1.0, 0.95, 0.9...
  });

  // === Bảng giảm giá theo thời gian đăng ký ===
  pgm.createTable('time_discounts', {
    months: { type: 'integer', primaryKey: true }, // 1, 3, 6, 12
    discount_multiplier: { type: 'numeric', notNull: true },
  });

  // === Đăng ký gói (subscription) của người dùng ===
  pgm.createTable('user_subscriptions', {
    id: 'id',
    user_id: { type: 'integer', notNull: true, references: 'users(id)' },
    package_name: { type: 'text', notNull: true, references: 'package_discounts(package_name)' },
    months: { type: 'integer', notNull: true },
    start_date: { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
    end_date: { type: 'date', notNull: true },
    total_price: { type: 'numeric', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') },
  });

  // === Danh sách các bot trong 1 subscription ===
  pgm.createTable('user_subscription_bots', {
    id: 'id',
    subscription_id: {
      type: 'integer',
      notNull: true,
      references: 'user_subscriptions(id)',
      onDelete: 'CASCADE',
    },
    bot_id: { type: 'integer', notNull: true, references: 'bots(id)' },
    price: { type: 'numeric', notNull: true }, // Giá gốc (trước giảm) hoặc đã giảm tùy cách tính
  });

  // === Lịch sử đầu tư của người dùng ===
  pgm.createTable('investment_orders', {
    id: 'id',
    user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
    capital_amount: { type: 'numeric(23, 3)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    start_at: { type: 'timestamp' },
    confirmed_at: { type: 'timestamp' },
    end_date: { type: 'timestamp' },
    status: { type: 'varchar(20)', default: 'pending' }, // pending, confirmed, rejected
    note: { type: 'text' },
  });

  // === Thống kê hiệu suất theo bot mỗi ngày ===
  pgm.createTable('daily_bot_stats', {
    id: 'id',
    bot_id: { type: 'int', notNull: true, references: 'bots', onDelete: 'cascade' },
    date: { type: 'date', notNull: true },
    gain: { type: 'numeric(12, 6)' },
    total_gain: { type: 'numeric(26, 6)' },
  });
  pgm.addConstraint('daily_bot_stats', 'unique_bot_date', 'UNIQUE(bot_id, date)');

  // === Thống kê VN30 mỗi ngày ===
  pgm.createTable('vn30_daily_stats', {
    id: 'id',
    date: { type: 'date', notNull: true, unique: true },
    gain: { type: 'numeric(12, 6)' },
    total_gain: { type: 'numeric(26, 6)' },
  });

  // === RÚT TIỀN ===
  pgm.createTable('withdrawal_requests', {
    id: 'id',
    user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
    amount: { type: 'numeric(22, 2)', notNull: true },
    requested_at: { type: 'timestamp', notNull: true },
    confirmed_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', default: 'pending' },
    note: { type: 'text' },
  });

  // === NẠP TIỀN ===
  pgm.createTable('deposit_requests', {
    id: 'id',
    user_id: { type: 'int', notNull: true, references: 'users', onDelete: 'cascade' },
    amount: { type: 'numeric(22, 2)', notNull: true },
    requested_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    confirmed_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', default: 'pending' },
    method: { type: 'varchar(50)', default: 'bank_transfer' },
    transaction_id: { type: 'varchar(255)' },
    note: { type: 'text' },
  });

  // === Tài khoản ngân hàng hệ thống ===
  pgm.createTable('system_bank_account', {
    id: 'id',
    bank_name: { type: 'text', notNull: true },
    account_number: { type: 'text', notNull: true },
    account_holder: { type: 'text', notNull: true },
    qr_code: { type: 'text', notNull: false },
    is_active: { type: 'boolean', notNull: true, default: true },
  });

  // === Khách đăng kí để lại thông tin ===
  pgm.createTable('guest_join_requests', {
    id: 'id',
    full_name: { type: 'varchar(100)', notNull: true },
    phone: { type: 'varchar(20)', notNull: true },
    email: { type: 'varchar(255)', notNull: true },
    package_name: { type: 'text' },
    duration_months: { type: 'int', notNull: true },
    selected_bot_ids: { type: 'jsonb', notNull: true }, // lưu mảng ID bot
    note: { type: 'text' },
    submitted_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createTable('system_total_capital', {
    id: 'id',
    current_amount: { type: 'numeric', notNull: true, default: 0 },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('system_daily_stats', {
    id: 'id',
    date: { type: 'date', notNull: true, unique: true },
    gain: { type: 'numeric(12, 6)' },
    total_gain: { type: 'numeric(26, 6)' },
  });

  pgm.createTable('daily_user_profits', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    date: { type: 'date', notNull: true },
    capital_on_day: { type: 'numeric(20, 6)', notNull: true },
    gain: { type: 'numeric(12, 6)', default: 0 },
    total_gain: { type: 'numeric(12, 6)', default: 0 },
  }, {
    unique: ['user_id', 'date'],
  });

};

exports.down = (pgm) => {
  // Drop theo thứ tự ngược lại để tránh lỗi ràng buộc
  pgm.dropTable('daily_user_profits');
  pgm.dropTable('system_total_capital');
  pgm.dropTable('guest_join_requests');
  pgm.dropTable('system_bank_account');
  pgm.dropTable('deposit_requests');
  pgm.dropTable('withdrawal_requests');
  pgm.dropTable('vn30_daily_stats');
  pgm.dropConstraint('daily_bot_stats', 'unique_bot_date');
  pgm.dropTable('daily_bot_stats');
  pgm.dropTable('investment_orders');
  pgm.dropTable('user_subscription_bots');
  pgm.dropTable('user_subscriptions');
  pgm.dropTable('time_discounts');
  pgm.dropTable('package_discounts');
  pgm.dropTable('bot_risk_prices');
  pgm.dropTable('bot_channels');
  pgm.dropTable('bots');
  pgm.dropTable('user_profiles');
  pgm.dropTable('users');
};
