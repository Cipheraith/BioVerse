# BioVerse Server Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the BioVerse server in various environments, from development to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **PostgreSQL**: Version 12.x or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended for production)
- **Storage**: Minimum 10GB free space

### Software Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install curl wget git build-essential

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install node postgresql git

# Windows (using Chocolatey)
choco install nodejs postgresql git
```

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bioverse/server.git
cd bioverse-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 4. Database Setup

```bash
# Create database user
sudo -u postgres createuser --interactive
# Enter username: bioverse_admin
# Superuser: y

# Create database
sudo -u postgres createdb bioverse_zambia_db

# Set password for user
sudo -u postgres psql
ALTER USER bioverse_admin PASSWORD 'your_secure_password';
\q
```

### 5. Initialize Database

```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create application user
sudo useradd -r -s /bin/bash bioverse
sudo mkdir -p /opt/bioverse
sudo chown bioverse:bioverse /opt/bioverse
```

### 2. Install Production Dependencies

```bash
# Switch to application user
sudo -u bioverse bash

# Clone repository
cd /opt/bioverse
git clone https://github.com/bioverse/server.git .

# Install dependencies
npm ci --only=production
```

### 3. Environment Configuration

```bash
# Create production environment file
sudo -u bioverse nano /opt/bioverse/.env
```

```env
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bioverse_zambia_db
DB_USER=bioverse_admin
DB_PASSWORD=your_secure_password

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# API Configuration
API_RATE_LIMIT=1000
ENABLE_RATE_LIMITING=true
ENABLE_REQUEST_LOGGING=false

# Performance
API_AVG_RESPONSE_TIME=0.05
API_ERROR_RATE=0.1
API_UPTIME=99.9%
```

### 4. Database Setup for Production

```bash
# Create production database
sudo -u postgres createdb bioverse_zambia_db_prod

# Create database user
sudo -u postgres psql
CREATE USER bioverse_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bioverse_zambia_db_prod TO bioverse_admin;
\q

# Run migrations
sudo -u bioverse npm run db:migrate
```

### 5. Process Management with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
sudo -u bioverse nano /opt/bioverse/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'bioverse-server',
    script: './src/index.js',
    cwd: '/opt/bioverse',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 5000,
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
```

```bash
# Create logs directory
sudo -u bioverse mkdir -p /opt/bioverse/logs

# Start application with PM2
sudo -u bioverse pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u bioverse pm2 save

# Setup PM2 startup script
sudo pm2 startup systemd -u bioverse --hp /home/bioverse
```

### 6. Reverse Proxy with Nginx

```bash
# Install Nginx
sudo apt install nginx

# Create server configuration
sudo nano /etc/nginx/sites-available/bioverse
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO specific configuration
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bioverse /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 7. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 8. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432/tcp  # PostgreSQL (if needed)
sudo ufw --force enable
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bioverse -u 1001

# Change ownership
RUN chown -R bioverse:nodejs /usr/src/app
USER bioverse

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  bioverse-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=bioverse_zambia_db
      - DB_USER=bioverse_admin
      - DB_PASSWORD=your_secure_password
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - bioverse-network

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=bioverse_zambia_db
      - POSTGRES_USER=bioverse_admin
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/config/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped
    networks:
      - bioverse-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - bioverse-server
    restart: unless-stopped
    networks:
      - bioverse-network

volumes:
  postgres_data:

networks:
  bioverse-network:
    driver: bridge
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f bioverse-server

# Scale application
docker-compose up -d --scale bioverse-server=3
```

## Database Setup

### PostgreSQL Optimization

```sql
-- Create database with optimized settings
CREATE DATABASE bioverse_zambia_db
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE template0;

-- Create user with limited privileges
CREATE USER bioverse_admin WITH PASSWORD 'your_secure_password';
GRANT CONNECT ON DATABASE bioverse_zambia_db TO bioverse_admin;
GRANT USAGE ON SCHEMA public TO bioverse_admin;
GRANT CREATE ON SCHEMA public TO bioverse_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bioverse_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bioverse_admin;
```

### Database Backup Strategy

```bash
# Create backup script
sudo nano /opt/bioverse/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/bioverse/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="bioverse_zambia_db"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U bioverse_admin -d $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
```

```bash
# Make script executable
chmod +x /opt/bioverse/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/bioverse/backup.sh
```

## Environment Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bioverse_zambia_db
DB_USER=bioverse_admin
DB_PASSWORD=your_secure_password
DB_SSL=true

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# API Configuration
API_RATE_LIMIT=1000
ENABLE_RATE_LIMITING=true
ENABLE_REQUEST_LOGGING=false

# Performance Monitoring
API_AVG_RESPONSE_TIME=0.05
API_ERROR_RATE=0.1
API_UPTIME=99.9%

# Security
SESSION_SECRET=your_session_secret
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/bioverse/app.log
```

### Security Hardening

```bash
# Set proper file permissions
sudo chown -R bioverse:bioverse /opt/bioverse
sudo chmod -R 750 /opt/bioverse
sudo chmod 600 /opt/bioverse/.env

# Create log directory
sudo mkdir -p /var/log/bioverse
sudo chown bioverse:bioverse /var/log/bioverse
```

## SSL/TLS Configuration

### Manual SSL Setup

```bash
# Generate self-signed certificate (for testing)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/bioverse.key \
  -out /etc/ssl/certs/bioverse.crt

# Set proper permissions
sudo chmod 600 /etc/ssl/private/bioverse.key
sudo chmod 644 /etc/ssl/certs/bioverse.crt
```

### Let's Encrypt Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Logging

### Application Monitoring

```javascript
// ecosystem.config.js - PM2 monitoring
module.exports = {
  apps: [{
    name: 'bioverse-server',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    monitoring: true,
    pmx: true,
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/bioverse
```

```
/var/log/bioverse/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 bioverse bioverse
    postrotate
        pm2 reload bioverse-server
    endscript
}
```

### Health Monitoring Script

```bash
#!/bin/bash
# health-check.sh
URL="http://localhost:3000/health"
EMAIL="admin@bioverse.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $response -ne 200 ]; then
    echo "Health check failed! HTTP Status: $response" | mail -s "BioVerse Server Down" $EMAIL
    pm2 restart bioverse-server
fi
```

## Backup and Recovery

### Database Backup

```bash
# Full backup
pg_dump -h localhost -U bioverse_admin -d bioverse_zambia_db > backup.sql

# Compressed backup
pg_dump -h localhost -U bioverse_admin -d bioverse_zambia_db | gzip > backup.sql.gz

# Schema only
pg_dump -h localhost -U bioverse_admin -d bioverse_zambia_db -s > schema.sql
```

### Application Backup

```bash
# Create full system backup
tar -czf bioverse-backup-$(date +%Y%m%d).tar.gz \
  /opt/bioverse \
  /etc/nginx/sites-available/bioverse \
  /etc/ssl/certs/bioverse.crt \
  /etc/ssl/private/bioverse.key
```

### Recovery Process

```bash
# Restore database
psql -h localhost -U bioverse_admin -d bioverse_zambia_db < backup.sql

# Restore application
tar -xzf bioverse-backup-20250718.tar.gz -C /

# Restart services
sudo systemctl restart nginx
pm2 restart bioverse-server
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U bioverse_admin -d bioverse_zambia_db
   ```

3. **PM2 Process Not Starting**
   ```bash
   # Check logs
   pm2 logs bioverse-server
   
   # Restart process
   pm2 restart bioverse-server
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

### Performance Optimization

```bash
# Optimize PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
```

```
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9

# Connection settings
max_connections = 100
```

### Log Analysis

```bash
# Check application logs
pm2 logs bioverse-server

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system logs
sudo journalctl -u bioverse-server -f
```

## Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.yml for multiple instances
version: '3.8'
services:
  bioverse-server:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### Load Balancing

```nginx
# nginx-lb.conf
upstream bioverse_backend {
    server bioverse-server:3000;
    server bioverse-server:3001;
    server bioverse-server:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://bioverse_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Support and Maintenance

### Update Process

```bash
# Backup before update
./backup.sh

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Run migrations
npm run db:migrate

# Restart application
pm2 restart bioverse-server
```

### Monitoring Dashboard

Access PM2 monitoring:
```bash
pm2 monit
```

For production monitoring, consider:
- Prometheus + Grafana
- New Relic
- DataDog
- ELK Stack

## Contact Information

For deployment support:
- Email: devops@bioverse.com
- Documentation: https://docs.bioverse.com
- Support: https://support.bioverse.com
