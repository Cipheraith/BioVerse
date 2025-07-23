const express = require('express');
const router = express.Router();
const { getPerformanceStats, resetStats } = require('../middleware/performance');

// Get performance statistics
router.get('/stats', authenticateToken, authorizeRoles(['admin', 'moh']), (req, res) => {
  try {
    const stats = getPerformanceStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to retrieve performance statistics',
      error: error.message 
    });
  }
});

// Reset performance statistics
router.post('/reset', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  try {
    resetStats();
    res.json({ message: 'Performance statistics reset successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to reset performance statistics',
      error: error.message 
    });
  }
});

// Get system health check
router.get('/health', (req, res) => {
  const stats = getPerformanceStats();
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: stats.uptime,
    memory: {
      used: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${memoryUsagePercent.toFixed(2)}%`
    },
    requests: {
      total: stats.totalRequests,
      avgResponseTime: `${stats.avgResponseTime}ms`,
      errorRate: `${stats.errorRate}%`
    }
  };
  
  // Determine health status
  if (memoryUsagePercent > 90 || parseFloat(stats.errorRate) > 10) {
    health.status = 'unhealthy';
  } else if (memoryUsagePercent > 70 || parseFloat(stats.errorRate) > 5) {
    health.status = 'warning';
  }
  
  res.json(health);
});

module.exports = router;
