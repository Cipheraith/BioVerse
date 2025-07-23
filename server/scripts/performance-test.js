#!/usr/bin/env node

/**
 * Free Performance Testing Script
 * Tests server performance without external tools
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS) || 10;
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS) || 100;

class PerformanceTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
      errors: []
    };
  }

  /**
   * Make HTTP request and measure performance
   */
  async makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const req = http.request(url, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            success: res.statusCode < 400,
            data: responseData
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: 0,
          responseTime,
          success: false,
          error: error.message
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Run concurrent requests
   */
  async runConcurrentRequests(url, count) {
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(this.makeRequest(url));
    }
    
    const results = await Promise.all(promises);
    
    // Process results
    results.forEach(result => {
      this.results.totalRequests++;
      this.results.responseTimes.push(result.responseTime);
      this.results.totalTime += result.responseTime;
      
      if (result.success) {
        this.results.successfulRequests++;
      } else {
        this.results.failedRequests++;
        this.results.errors.push(result.error || `HTTP ${result.statusCode}`);
      }
      
      // Update min/max response times
      this.results.minResponseTime = Math.min(this.results.minResponseTime, result.responseTime);
      this.results.maxResponseTime = Math.max(this.results.maxResponseTime, result.responseTime);
    });
  }

  /**
   * Calculate statistics
   */
  calculateStats() {
    const sortedTimes = [...this.results.responseTimes].sort((a, b) => a - b);
    const total = sortedTimes.length;
    
    return {
      totalRequests: this.results.totalRequests,
      successfulRequests: this.results.successfulRequests,
      failedRequests: this.results.failedRequests,
      successRate: ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2),
      
      // Response time statistics
      avgResponseTime: (this.results.totalTime / this.results.totalRequests).toFixed(2),
      minResponseTime: this.results.minResponseTime.toFixed(2),
      maxResponseTime: this.results.maxResponseTime.toFixed(2),
      
      // Percentiles
      p50: sortedTimes[Math.floor(total * 0.5)].toFixed(2),
      p90: sortedTimes[Math.floor(total * 0.9)].toFixed(2),
      p95: sortedTimes[Math.floor(total * 0.95)].toFixed(2),
      p99: sortedTimes[Math.floor(total * 0.99)].toFixed(2),
      
      // Throughput
      requestsPerSecond: (this.results.totalRequests / (this.results.totalTime / this.results.totalRequests / 1000)).toFixed(2),
      
      errors: [...new Set(this.results.errors)] // Unique errors only
    };
  }

  /**
   * Display results
   */
  displayResults(stats) {
    console.log('\n🚀 BioVerse Performance Test Results');
    console.log('=====================================');
    
    // Request statistics
    console.log(`\n📊 Request Statistics:`);
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Successful: ${stats.successfulRequests}`);
    console.log(`   Failed: ${stats.failedRequests}`);
    console.log(`   Success Rate: ${stats.successRate}%`);
    
    // Response time statistics
    console.log(`\n⏱️  Response Time Statistics (ms):`);
    console.log(`   Average: ${stats.avgResponseTime}ms`);
    console.log(`   Minimum: ${stats.minResponseTime}ms`);
    console.log(`   Maximum: ${stats.maxResponseTime}ms`);
    
    // Percentiles
    console.log(`\n📈 Response Time Percentiles (ms):`);
    console.log(`   50th percentile: ${stats.p50}ms`);
    console.log(`   90th percentile: ${stats.p90}ms`);
    console.log(`   95th percentile: ${stats.p95}ms`);
    console.log(`   99th percentile: ${stats.p99}ms`);
    
    // Throughput
    console.log(`\n🔄 Throughput:`);
    console.log(`   Requests per second: ${stats.requestsPerSecond}`);
    
    // Performance assessment
    console.log(`\n🎯 Performance Assessment:`);
    if (parseFloat(stats.avgResponseTime) < 100) {
      console.log(`   ✅ Excellent - Average response time under 100ms`);
    } else if (parseFloat(stats.avgResponseTime) < 500) {
      console.log(`   ✅ Good - Average response time under 500ms`);
    } else if (parseFloat(stats.avgResponseTime) < 1000) {
      console.log(`   ⚠️  Acceptable - Average response time under 1s`);
    } else {
      console.log(`   ❌ Poor - Average response time over 1s`);
    }
    
    if (parseFloat(stats.successRate) > 99) {
      console.log(`   ✅ Excellent reliability - ${stats.successRate}% success rate`);
    } else if (parseFloat(stats.successRate) > 95) {
      console.log(`   ✅ Good reliability - ${stats.successRate}% success rate`);
    } else {
      console.log(`   ❌ Poor reliability - ${stats.successRate}% success rate`);
    }
    
    // Errors
    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      stats.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    console.log('\n=====================================\n');
  }

  /**
   * Run complete performance test
   */
  async runTest() {
    console.log(`🚀 Starting performance test...`);
    console.log(`📍 Target: ${BASE_URL}`);
    console.log(`🔢 Total requests: ${TOTAL_REQUESTS}`);
    console.log(`🔄 Concurrent requests: ${CONCURRENT_REQUESTS}`);
    console.log(`\n⏳ Testing in progress...`);
    
    const testStartTime = performance.now();
    
    // Run tests in batches
    const batchSize = CONCURRENT_REQUESTS;
    const batches = Math.ceil(TOTAL_REQUESTS / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const requestsInBatch = Math.min(batchSize, TOTAL_REQUESTS - (i * batchSize));
      console.log(`   Batch ${i + 1}/${batches} - ${requestsInBatch} requests`);
      
      await this.runConcurrentRequests(`${BASE_URL}/health`, requestsInBatch);
    }
    
    const testEndTime = performance.now();
    const totalTestTime = testEndTime - testStartTime;
    
    console.log(`\n✅ Test completed in ${(totalTestTime / 1000).toFixed(2)} seconds`);
    
    const stats = this.calculateStats();
    this.displayResults(stats);
    
    return stats;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runTest().catch(console.error);
}

module.exports = PerformanceTester;
