let client = null;

if (process.env.REDIS_URL) {
  const Redis = require('ioredis');
  client = new Redis(process.env.REDIS_URL);
  client.on('connect', () => console.log('[Redis] Connected'));
  client.on('error',   (e) => console.warn('[Redis]', e.message));
}

const mem = new Map();

module.exports = {
  set: async (key, val, ttl) => {
    if (client) return ttl ? client.setex(key, ttl, String(val)) : client.set(key, String(val));
    mem.set(key, val);
  },
  get: async (key) => client ? client.get(key) : (mem.get(key) ?? null),
  del: async (key) => client ? client.del(key) : mem.delete(key),
};
