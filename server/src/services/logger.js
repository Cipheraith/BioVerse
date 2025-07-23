const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Performance optimizations for logging
const getLogLevel = () => {
  if (process.env.NODE_ENV === 'production') return 'warn';
  if (process.env.NODE_ENV === 'test') return 'error';
  return process.env.LOG_LEVEL || 'info';
};

// Create logger instance with performance optimizations
const logger = winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  defaultMeta: { service: 'bioverse-api' },
  transports: [
    // Write all logs to file with performance settings
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true, // Rotate files efficiently
      lazy: true, // Only open file when needed
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
      lazy: true,
    }),
  ],
  // Performance: Exit on error to prevent memory leaks
  exitOnError: false,
  // Silence winston internal errors in production
  silent: process.env.NODE_ENV === 'test',
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create specialized loggers for different modules
const createModuleLogger = (module) => {
  return {
    info: (message, meta = {}) => logger.info(message, { module, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { module, ...meta }),
    error: (message, meta = {}) => logger.error(message, { module, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { module, ...meta }),
  };
};

// Export logger and module logger factory
module.exports = {
  logger,
  createModuleLogger,
  // Convenience methods
  auth: createModuleLogger('auth'),
  api: createModuleLogger('api'),
  database: createModuleLogger('database'),
  ai: createModuleLogger('ai'),
  maternal: createModuleLogger('maternal-health'),
  socket: createModuleLogger('socket'),
  scheduler: createModuleLogger('scheduler'),
  predictive: createModuleLogger('predictive'),
  notification: createModuleLogger('notification'),
  // Main app logger for backward compatibility
  app: logger
};
