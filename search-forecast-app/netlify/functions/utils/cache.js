
---

## ⚙️ Netlify Functions

### 📄 `netlify/functions/utils/cache.js`
```javascript
/**
 * Cache LRU in-memory per ambiente di sviluppo.
 * ️ In produzione: sostituire con Upstash Redis o AWS ElastiCache.
 * Le funzioni serverless sono stateless; questa cache sopravvive solo tra invocazioni warm.
 */
const cache = new Map();
const TTL = 3600000; // 1 ora

module.exports = {
  get: (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  },
  set: (key, data) => cache.set(key, { data, timestamp: Date.now() }),
  clear: () => cache.clear()
};