// db.js
const { Pool, Client } = require("pg");
require('dotenv').config();

// Khởi tạo kết nối PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,         // mặc định PostgreSQL
});

// // Test kết nối
// pool.connect((err, client, release) => {
//     if (err) {
//         return console.error('❌ Error acquiring client', err.stack);
//     }
//     client.query('SELECT NOW()', (err, result) => {
//         release();
//         if (err) {
//             return console.error('❌ Error executing query', err.stack);
//         }
//         console.log('✅ Connected to PostgreSQL at:', result.rows[0].now);
//     });
// });

module.exports = pool;
