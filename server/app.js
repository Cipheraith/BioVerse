/**
 * Express app configuration — single source of truth.
 * Imported by src/index.js (server startup) and tests (supertest).
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { logger } = require("./src/services/logger");
const { performanceMonitor } = require("./src/middleware/performance");

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
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
  windowMs: 15 * 60 * 1000,
  max: process.env.API_RATE_LIMIT || 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

if (process.env.ENABLE_RATE_LIMITING === "true") {
  app.use("/api/", limiter);
}

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  if (process.env.ENABLE_REQUEST_LOGGING === "true") {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
  }
  req.startTime = Date.now();
  next();
});

// Performance monitoring
app.use(performanceMonitor);

// Swagger (optional)
try {
  const { setupSwagger } = require('./src/swagger');
  setupSwagger(app);
} catch (err) {
  logger.warn('Swagger setup skipped:', err.message);
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
  });
});

// Audit middleware for mutating requests
try {
  const auditMiddleware = require('./src/middleware/auditLogger');
  app.use('/api', (req, res, next) => {
    if (req.method !== 'GET') {
      const mw = auditMiddleware.genericAction('api_request', 'api');
      return mw(req, res, next);
    }
    return next();
  });
} catch (err) {
  logger.warn('Audit middleware not available:', err.message);
}

// All API routes — single mount point
const mainRouter = require('./src/routes/index');
app.use("/api", mainRouter);

module.exports = app;