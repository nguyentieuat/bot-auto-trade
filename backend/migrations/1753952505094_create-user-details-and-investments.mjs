/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // Bảng user_details
  pgm.createTable('user_details', {
    user_id: {
      type: 'integer',
      primaryKey: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    full_name: { type: 'varchar(100)' },
    avatar_url: { type: 'text' },
    bank_account: { type: 'varchar(50)' },
    bank_name: { type: 'varchar(100)' },
    capital: { type: 'bigint', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Bảng user_bot_investments
  pgm.createTable('user_bot_investments', {
    id: 'id',
    user_id: {
      type: 'integer',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    bot_id: {
      type: 'integer',
      references: 'bots(id)',
      onDelete: 'CASCADE',
    },
    invest_date: { type: 'date', notNull: true },
    capital: { type: 'bigint', notNull: true },
    gain: { type: 'bigint', default: 0 },
    total_gain: { type: 'bigint', default: 0 },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
