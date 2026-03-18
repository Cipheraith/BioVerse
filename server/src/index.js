/**
 * Server startup — imports the configured Express app from app.js
 * and handles database init, Socket.IO, schedulers, and graceful shutdown.
 */
const app = require("../app");
const http = require("http");
const { initializeDatabase } = require("./config/database");
const { startTransportScheduler } = require("./services/maternalHealthScheduler");
const { startCoordinationScheduler } = require("./services/coordinationScheduler");
const { logger } = require("./services/logger");
const { setupSocketIO } = require("./services/socketService");

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Start Server
initializeDatabase()
  .then(() => {
    setupSocketIO(server);

    server.listen(PORT, () => {
      logger.info(`🚀 BioVerse server running on http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`📊 Health check available at: http://localhost:${PORT}/health`);

      startTransportScheduler();
      startCoordinationScheduler();

      logger.info(`🔒 Rate limiting: ${process.env.ENABLE_RATE_LIMITING === "true" ? "Enabled" : "Disabled"}`);
      logger.info(`📝 Request logging: ${process.env.ENABLE_REQUEST_LOGGING === "true" ? "Enabled" : "Disabled"}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize database and start server:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
