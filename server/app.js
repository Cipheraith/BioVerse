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
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        connectSrc: ["'self'", "http://localhost:5173", "ws://localhost:5173"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
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
  next();
});

// Performance monitoring middleware
app.use(performanceMonitor);

// Import routers
const mainRouter = require('./src/routes/index');
const lumaRouter = require('./src/routes/luma');
const prescriptionsRouter = require('./src/routes/prescriptions');
const resourcesRouter = require('./src/routes/resources');
const wardsRouter = require('./src/routes/wards'); // Import wards router

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
app.use("/api", mainRouter);
app.use("/api/luma", lumaRouter);
app.use("/api/prescriptions", prescriptionsRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/wards", wardsRouter); // Register wards router

module.exports = app;