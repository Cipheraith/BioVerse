require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { initializeDatabase } = require("./config/database");

const mainRouter = require("./routes");
const {
  startTransportScheduler,
} = require("./services/maternalHealthScheduler");
const { logger } = require("./services/logger");
const { setupSocketIO } = require("./services/socketService");
const { performanceMonitor } = require("./middleware/performance");
const http = require("http");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Removed 'unsafe-inline' and 'unsafe-eval' for security
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: process.env.NODE_ENV === 'development' 
          ? ["'self'", "http://localhost:5173", "ws://localhost:5173", "http://localhost:3000", "ws://localhost:3000"]
          : ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? false : true,
  }),
);
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

if (process.env.ENABLE_RATE_LIMITING === "true") {
  app.use("/api/", limiter);
}

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.ENABLE_REQUEST_LOGGING === "true") {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
  }
  // attach request start time for performance/audit
  req.startTime = Date.now();
  next();
});

// Performance monitoring middleware
app.use(performanceMonitor);

// Swagger/OpenAPI docs
try {
  const { setupSwagger } = require('./swagger');
  setupSwagger(app);
} catch (err) {
  logger.warn('Swagger setup failed or swagger dependencies missing:', err.message);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
  });
});

// API Routes
// Attach audit middleware for non-GETs to ensure actions are audited
try {
  const auditMiddleware = require('./middleware/auditLogger');
  app.use('/api', (req, res, next) => {
    // use generic audit for mutating requests
    if (req.method !== 'GET') {
      const mw = auditMiddleware.genericAction('api_request', 'api');
      return mw(req, res, next);
    }
    return next();
  });
} catch (err) {
  logger.warn('Audit middleware not available:', err.message);
}

app.use("/api", mainRouter);
// Note: Luma is now handled by Python AI backend via /api/ai/chat

// Start Server
initializeDatabase()
  .then(() => {
    // Setup Socket.IO
    setupSocketIO(server);

    server.listen(PORT, () => {
      logger.info(`🚀 BioVerse server running on http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `📊 Health check available at: http://localhost:${PORT}/health`,
      );

      // Start background services
      startTransportScheduler();

      // Log important configuration
      logger.info(
        `🔒 Rate limiting: ${process.env.ENABLE_RATE_LIMITING === "true" ? "Enabled" : "Disabled"}`,
      );
      logger.info(
        `📝 Request logging: ${process.env.ENABLE_REQUEST_LOGGING === "true" ? "Enabled" : "Disabled"}`,
      );
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
