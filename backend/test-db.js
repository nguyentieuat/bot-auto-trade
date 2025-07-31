// test-db.js
const pool = require('./db');

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Không thể kết nối tới database:', err.stack);
    process.exit(1);
  } else {
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        console.error('❌ Lỗi khi truy vấn:', err.stack);
      } else {
        console.log('✅ Kết nối thành công! Giờ hệ thống:', result.rows[0].now);
      }
      process.exit(); // kết thúc tiến trình
    });
  }
});
