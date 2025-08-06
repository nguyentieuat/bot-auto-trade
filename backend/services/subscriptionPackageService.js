const pool = require('../db');

async function getAllSubscriptionPackages() {
  const query = `
    SELECT id, name, level, duration_months, base_price
    FROM subscription_packages
    ORDER BY duration_months;
  `;
  const result = await pool.query(query);
  return result.rows;
}

module.exports = {
  getAllSubscriptionPackages,
};