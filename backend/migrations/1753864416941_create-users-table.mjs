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

    pgm.createTable('users', {
        id: 'id',
        username: { type: 'varchar(100)', notNull: true, unique: true },
        phone: { type: 'varchar(100)', notNull: true, unique: true },
        email: { type: 'varchar(100)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { };
