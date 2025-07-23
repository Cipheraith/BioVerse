const path = require('path');
const express = require('express');

/**
 * Static files caching middleware
 * Sets appropriate cache headers for different file types
 */

const staticCacheMiddleware = (staticPath) => {
  return [
    // First middleware: Set cache headers based on file type
    (req, res, next) => {
      const ext = path.extname(req.path).toLowerCase();
      
      // Set cache headers based on file type
      switch (ext) {
        case '.js':
        case '.css':
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.ico':
        case '.svg':
        case '.woff':
        case '.woff2':
        case '.ttf':
        case '.eot':
          // Cache static assets for 1 year
          res.set({
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Expires': new Date(Date.now() + 31536000000).toUTCString()
          });
          break;
        
        case '.html':
        case '.htm':
          // Cache HTML files for 1 hour
          res.set({
            'Cache-Control': 'public, max-age=3600',
            'Expires': new Date(Date.now() + 3600000).toUTCString()
          });
          break;
        
        case '.json':
        case '.xml':
          // Cache API-like files for 5 minutes
          res.set({
            'Cache-Control': 'public, max-age=300',
            'Expires': new Date(Date.now() + 300000).toUTCString()
          });
          break;
        
        default:
          // Don't cache unknown file types
          res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
      }
      
      next();
    },
    
    // Second middleware: Serve static files
    express.static(staticPath, {
