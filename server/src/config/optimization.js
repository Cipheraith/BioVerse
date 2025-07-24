// Performance optimization for 2GB RAM demo environment
const os = require('os');

class PerformanceOptimizer {
  constructor() {
    this.totalMemory = os.totalmem();
    this.isLowResource = this.totalMemory < 3 * 1024 * 1024 * 1024; // Less than 3GB
    
    if (this.isLowResource) {
      console.log('🔧 Low resource mode activated - optimizing for demo...');
      this.applyOptimizations();
    }
  }

  applyOptimizations() {
    // Reduce Node.js memory usage
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_OPTIONS = '--max-old-space-size=512 --optimize-for-size';
    }

    // Garbage collection optimization
    if (global.gc) {
      setInterval(() => {
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed > 400 * 1024 * 1024) { // 400MB threshold
          global.gc();
          console.log('🧹 Memory cleanup performed');
        }
      }, 30000); // Every 30 seconds
    }
  }

  getDatabaseConfig() {
    return {
      // Optimized for low memory
      max: this.isLowResource ? 5 : 20,
      min: this.isLowResource ? 2 : 5,
      idleTimeoutMillis: this.isLowResource ? 15000 : 30000,
      connectionTimeoutMillis: this.isLowResource ? 1000 : 2000,
      query_timeout: this.isLowResource ? 5000 : 10000,
      statement_timeout: this.isLowResource ? 5000 : 10000
    };
  }

  getApiLimits() {
    return {
      requestTimeout: this.isLowResource ? 3000 : 5000,
      maxConcurrentRequests: this.isLowResource ? 3 : 10,
      cacheSize: this.isLowResource ? 50 : 200,
      enableCompression: true
    };
  }

  getSocketConfig() {
    return {
      maxConnections: this.isLowResource ? 20 : 100,
      pingTimeout: this.isLowResource ? 30000 : 60000,
      pingInterval: this.isLowResource ? 15000 : 25000,
      compression: true
    };
  }

  monitorPerformance() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      if (this.isLowResource) {
        console.log(`📊 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB | CPU: ${Math.round(cpuUsage.user / 1000)}ms`);
        
        // Alert if memory usage is high
        if (memUsage.heapUsed > 600 * 1024 * 1024) {
          console.warn('⚠️ High memory usage detected - consider restarting demo');
        }
      }
    }, 60000); // Every minute
  }

  // Quick data compression for API responses
  compressApiResponse(data) {
    if (this.isLowResource && typeof data === 'object') {
      // Remove unnecessary fields for demo
      const compressed = JSON.parse(JSON.stringify(data));
      
      // Remove large arrays if they exist
      Object.keys(compressed).forEach(key => {
        if (Array.isArray(compressed[key]) && compressed[key].length > 100) {
          compressed[key] = compressed[key].slice(0, 10); // Keep only first 10 items
          compressed[key].push({ truncated: true, originalLength: data[key].length });
        }
      });
      
      return compressed;
    }
    return data;
  }
}

module.exports = new PerformanceOptimizer();
