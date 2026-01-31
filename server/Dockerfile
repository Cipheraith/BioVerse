FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
# BioVerse Node.js Server Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine as production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S bioverse && \
    adduser -S bioverse -u 1001

# Set working directory
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p logs data && \
    chown -R bioverse:bioverse /app

# Switch to non-root user
USER bioverse

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]