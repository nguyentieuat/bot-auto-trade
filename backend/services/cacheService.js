// services/cacheService.js
const cache = new Map();

function setCache(key, value) {
  cache.set(key, {
    timestamp: new Date().toDateString(),
    data: value
  });
}

function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  const today = new Date().toDateString();
  if (cached.timestamp !== today) {
    cache.delete(key); // Optional: clean up
    return null;
  }

  return cached.data;
}

module.exports = {
  setCache,
  getCache
};
