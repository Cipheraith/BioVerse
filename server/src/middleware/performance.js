const { performance } = require('perf_hooks');
const { logger } = require('../services/logger');

// In-memory stats storage (suitable for single instance)
const stats = {
  requests: 0,
  totalResponseTime: 0,
  errors: 0,
  endpoints: new Map(),
  startTime: Date.now()
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  
  // Track request count
  stats.requests++;
  
  // Track endpoint usage
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  if (!stats.endpoints.has(endpoint)) {
    stats.endpoints.set(endpoint, {
      requests: 0,
      totalTime: 0,
      errors: 0
    });
  }
  
  const endpointStats = stats.endpoints.get(endpoint);
  endpointStats.requests++;
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Update global stats
    stats.totalResponseTime += responseTime;
    endpointStats.totalTime += responseTime;
    
    // Track errors
    if (res.statusCode >= 400) {
      stats.errors++;
      endpointStats.errors++;
    }
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`Slow request: ${endpoint} took ${responseTime.toFixed(2)}ms`);
    }
    
    // Call original end
    originalEnd.apply(this, args);
  };
  
  next();
};

// Get performance statistics
const getPerformanceStats = () => {
  const uptime = Date.now() - stats.startTime;
  const avgResponseTime = stats.requests > 0 ? stats.totalResponseTime / stats.requests : 0;
  const errorRate = stats.requests > 0 ? (stats.errors / stats.requests) * 100 : 0;
  
  const topEndpoints = Array.from(stats.endpoints.entries())
    .map(([endpoint, data]) => ({
      endpoint,
      requests: data.requests,
      avgResponseTime: data.requests > 0 ? data.totalTime / data.requests : 0,
      errorRate: data.requests > 0 ? (data.errors / data.requests) * 100 : 0
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);
  
  return {
    uptime: Math.floor(uptime / 1000), // in seconds
    totalRequests: stats.requests,
    totalErrors: stats.errors,
    avgResponseTime: avgResponseTime.toFixed(2),
    errorRate: errorRate.toFixed(2),
    topEndpoints,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };
};

// Reset statistics
const resetStats = () => {
  stats.requests = 0;
  stats.totalResponseTime = 0;
  stats.errors = 0;
  stats.endpoints.clear();
  stats.startTime = Date.now();
};

// Memory monitoring and garbage collection hints
const monitorMemory = () => {
  const memUsage = process.memoryUsage();
  const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  // Suggest garbage collection if memory usage is high
  if (memUsagePercent > 80) {
    logger.warn('High memory usage detected', {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${memUsagePercent.toFixed(2)}%`
    });
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      logger.info('Garbage collection triggered');
    }
  }
};

// Log performance stats periodically
setInterval(() => {
  const performanceStats = getPerformanceStats();
  
  // Only log in development or if there are issues
  if (process.env.NODE_ENV !== 'production' || parseFloat(performanceStats.errorRate) > 1) {
    logger.info('Performance Stats:', {
      uptime: `${performanceStats.uptime}s`,
      requests: performanceStats.totalRequests,
      avgResponseTime: `${performanceStats.avgResponseTime}ms`,
      errorRate: `${performanceStats.errorRate}%`,
      memoryUsage: `${(performanceStats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
    });
  }
  
  // Monitor memory usage
  monitorMemory();
}, 300000); // Log every 5 minutes

// Check memory usage every minute
setInterval(monitorMemory, 60000);

module.exports = {
  performanceMonitor,
  getPerformanceStats,
  resetStats
};
