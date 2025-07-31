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
    pgm.createTable('bots', {
        id: 'id',
        name: { type: 'varchar(100)', notNull: true, unique: true },
        description: { type: 'text' },
        avatar_url: { type: 'text' },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });

    pgm.createTable('bot_links', {
        id: 'id',
        bot_id: {
            type: 'integer',
            notNull: true,
            references: 'bots(id)',
            onDelete: 'CASCADE'
        },
        telegram_url: { type: 'text', notNull: true },
        label: { type: 'varchar(100)' },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { };
