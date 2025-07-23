/**
 * In-Memory Cache Service
 * Free alternative to Redis for caching frequently accessed data
 */

class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Set cache entry with TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {any} value - Cache value
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttl = 300) {
    // Clear existing timeout if key exists
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set cache entry with timestamp
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    });

    // Set timeout to auto-delete
    const timeout = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timeouts.set(key, timeout);
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Cache with function execution (memoization)
   * @param {string} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {number} ttl - Time to live in seconds
   */
  async memoize(key, fn, ttl = 300) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

// Create singleton instance
const cache = new InMemoryCache();

module.exports = {
  cache,
  InMemoryCache
};
