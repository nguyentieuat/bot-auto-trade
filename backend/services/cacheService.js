const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 86400 }); // TTL: 5 phút

module.exports = {
  getCache: (key) => myCache.get(key),
  setCache: (key, value) => myCache.set(key, value),
  clearCache: (key) => myCache.del(key),
};
