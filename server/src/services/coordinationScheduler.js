const { runCoordinationCycle } = require('./coordinationService');
const { logger } = require('./logger');

const COORDINATION_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/**
 * Start the coordination scheduler
 * Runs immediately on startup, then every 6 hours
 */
function startCoordinationScheduler() {
  logger.info('Starting Coordination Scheduler (6-hour interval)');
  
  // Run immediately on startup
  runCoordinationCycle().catch(err => {
    logger.error('Initial coordination cycle failed:', err);
  });
  
  // Schedule recurring runs
  setInterval(() => {
    runCoordinationCycle().catch(err => {
      logger.error('Scheduled coordination cycle failed:', err);
    });
  }, COORDINATION_INTERVAL);
  
  logger.info('Coordination Scheduler started successfully');
}

module.exports = {
  startCoordinationScheduler
};
