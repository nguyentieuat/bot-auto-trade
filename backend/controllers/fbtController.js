const { getCache, setCache } = require('../services/cacheService');
const pool = require('../db');

const CACHE_KEY = 'active_bot_stats';
const CACHE_EXPIRE_MS = 24 * 60 * 60 * 1000; // 24h
let isRefreshing = false;
let refreshPromise = null;

// Query + lưu cache
async function fetchAndCacheData() {
  console.log('🔄 Refreshing bot stats cache from DB...');
  const { rows } = await pool.query(`
    SELECT b.id AS bot_id, b.name, b.risk_level, d.*
    FROM bots b
    JOIN daily_bot_stats d ON b.id = d.bot_id
    WHERE b.status = 'active'
    ORDER BY b.risk_level ASC, d.date ASC
  `);

  const grouped = {};
  rows.forEach(row => {
    if (!grouped[row.name]) grouped[row.name] = [];
    grouped[row.name].push(row);
  });

  setCache(CACHE_KEY, {
    data: grouped,
    lastUpdated: Date.now()
  });

  console.log('✅ Cache updated successfully');
  return grouped;
}

// API handler
async function getAllActiveBotStats(req, res) {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 4;

  try {
    let cached = getCache(CACHE_KEY);
    const isExpired = !cached || (Date.now() - cached.lastUpdated > CACHE_EXPIRE_MS);

    if (isExpired && !isRefreshing) {
      isRefreshing = true;
      refreshPromise = fetchAndCacheData().finally(() => {
        isRefreshing = false;
      });
    }

    // Nếu cache rỗng → đợi fetch
    if (!cached?.data) {
      cached = { data: await refreshPromise, lastUpdated: Date.now() };
    }

    const grouped = cached.data;
    const allBotNames = Object.keys(grouped);
    const pagedBotNames = allBotNames.slice(offset, offset + limit);
    const pagedGrouped = Object.fromEntries(
      pagedBotNames.map(name => [name, grouped[name]])
    );

    res.json({
      hasMore: offset + limit < allBotNames.length,
      bots: pagedGrouped
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bot stats' });
  }
}

// Lên lịch refresh cache mỗi ngày 00:05
function scheduleDailyCacheRefresh() {
  const now = new Date();
  const nextRefresh = new Date();
  nextRefresh.setHours(0, 5, 0, 0); // 00:05 sáng
  if (nextRefresh <= now) {
    nextRefresh.setDate(nextRefresh.getDate() + 1); // sang ngày hôm sau
  }

  const delay = nextRefresh - now;
  console.log(`⏳ Next cache refresh scheduled in ${Math.round(delay / 1000 / 60)} minutes`);

  setTimeout(() => {
    fetchAndCacheData().catch(console.error);
    setInterval(() => {
      fetchAndCacheData().catch(console.error);
    }, CACHE_EXPIRE_MS);
  }, delay);
}

// Khi server start → load cache ngay + set lịch
(async () => {
  await fetchAndCacheData().catch(console.error);
  scheduleDailyCacheRefresh();
})();

module.exports = {
  getAllActiveBotStats
};
