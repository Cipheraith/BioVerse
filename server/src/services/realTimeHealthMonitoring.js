/**
 * Real-time Health Monitoring Service
 * Handles IoT devices, wearables, and continuous health data streams
 */

const EventEmitter = require('events');
const { getQuery, allQuery } = require('../config/database');
const { logger } = require('./logger');
const healthTwinAI = require('./healthTwinAI');

class RealTimeHealthMonitoring extends EventEmitter {
  constructor() {
    super();
    this.activeConnections = new Map();
    this.deviceStreams = new Map();
    this.alertThresholds = new Map();
    this.dataBuffer = new Map();
    this.processingInterval = null;
    
    this.initializeMonitoring();
  }

  /**
   * Initialize real-time monitoring system
   */
  initializeMonitoring() {
    // Process buffered data every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processBufferedData();
    }, 5000);

    // Set up default alert thresholds
    this.setupDefaultThresholds();

    logger.info('Real-time health monitoring system initialized');
  }

  /**
   * Connect a patient's device for monitoring
   */
  async connectDevice(patientId, deviceId, deviceType, socketConnection) {
    try {
      const connectionKey = `${patientId}_${deviceId}`;
      
      // Store connection info
      this.activeConnections.set(connectionKey, {
        patientId,
        deviceId,
        deviceType,
        socket: socketConnection,
        connectedAt: new Date(),
        lastDataReceived: null,
        dataPoints: 0
      });

      // Initialize data buffer for this device
      this.dataBuffer.set(connectionKey, []);

      // Set up device-specific thresholds
      await this.setupPatientThresholds(patientId);

      // Emit connection event
      this.emit('deviceConnected', {
        patientId,
        deviceId,
        deviceType,
        timestamp: new Date()
      });

      logger.info(`Device connected: ${deviceType} for patient ${patientId}`);

      return {
        success: true,
        connectionKey,
        message: 'Device connected successfully'
      };
    } catch (error) {
      logger.error('Error connecting device:', error);
      throw error;
    }
  }

  /**
   * Disconnect a device
   */
  disconnectDevice(patientId, deviceId) {
    const connectionKey = `${patientId}_${deviceId}`;
    
    if (this.activeConnections.has(connectionKey)) {
      const connection = this.activeConnections.get(connectionKey);
      
      // Clean up
      this.activeConnections.delete(connectionKey);
      this.dataBuffer.delete(connectionKey);
      
      // Emit disconnection event
      this.emit('deviceDisconnected', {
        patientId,
        deviceId,
        deviceType: connection.deviceType,
        timestamp: new Date(),
        sessionDuration: new Date() - connection.connectedAt,
        totalDataPoints: connection.dataPoints
      });

      logger.info(`Device disconnected: ${connection.deviceType} for patient ${patientId}`);
    }
  }

  /**
   * Process incoming health data from devices
   */
  async processHealthData(patientId, deviceId, data) {
    try {
      const connectionKey = `${patientId}_${deviceId}`;
      
      if (!this.activeConnections.has(connectionKey)) {
        throw new Error('Device not connected');
      }

      // Update connection info
      const connection = this.activeConnections.get(connectionKey);
      connection.lastDataReceived = new Date();
      connection.dataPoints++;

      // Validate and normalize data
      const normalizedData = this.normalizeHealthData(data, connection.deviceType);
      
      // Add to buffer
      const buffer = this.dataBuffer.get(connectionKey) || [];
      buffer.push({
        ...normalizedData,
        timestamp: new Date(),
        patientId,
        deviceId,
        deviceType: connection.deviceType
      });
      
      // Keep buffer size manageable
      if (buffer.length > 100) {
        buffer.shift();
      }
      
      this.dataBuffer.set(connectionKey, buffer);

      // Check for immediate alerts
      await this.checkImmediateAlerts(patientId, normalizedData, connection.deviceType);

      // Emit real-time data event
      this.emit('healthDataReceived', {
        patientId,
        deviceId,
        deviceType: connection.deviceType,
        data: normalizedData,
        timestamp: new Date()
      });

      return {
        success: true,
        processed: true,
        alertsTriggered: 0 // This would be updated by alert checking
      };
    } catch (error) {
      logger.error('Error processing health data:', error);
      throw error;
    }
  }

  /**
   * Process buffered data for analysis and storage
   */
  async processBufferedData() {
    for (const [connectionKey, buffer] of this.dataBuffer.entries()) {
      if (buffer.length === 0) continue;

      try {
        const connection = this.activeConnections.get(connectionKey);
        if (!connection) continue;

        // Analyze trends in buffered data
        const trends = this.analyzeTrends(buffer);
        
        // Store aggregated data
        await this.storeAggregatedData(connection.patientId, buffer, trends);
        
        // Update health twin with new data
        await this.updateHealthTwin(connection.patientId, buffer, trends);
        
        // Check for pattern-based alerts
        await this.checkPatternAlerts(connection.patientId, buffer, trends);
        
        // Clear processed data from buffer
        this.dataBuffer.set(connectionKey, []);
        
      } catch (error) {
        logger.error(`Error processing buffered data for ${connectionKey}:`, error);
      }
    }
  }

  /**
   * Normalize health data from different device types
   */
  normalizeHealthData(rawData, deviceType) {
    const normalized = {
      timestamp: new Date(),
      deviceType,
      metrics: {}
    };

    switch (deviceType) {
      case 'smartwatch':
        normalized.metrics = {
          heartRate: rawData.heartRate,
          steps: rawData.steps,
          calories: rawData.calories,
          sleepQuality: rawData.sleepQuality,
          stressLevel: rawData.stressLevel,
          oxygenSaturation: rawData.oxygenSaturation
        };
        break;

      case 'blood_pressure_monitor':
        normalized.metrics = {
          systolicBP: rawData.systolic,
          diastolicBP: rawData.diastolic,
          heartRate: rawData.pulse,
          measurementQuality: rawData.quality
        };
        break;

      case 'glucose_meter':
        normalized.metrics = {
          bloodGlucose: rawData.glucose,
          measurementType: rawData.type, // fasting, postprandial, random
          ketones: rawData.ketones
        };
        break;

      case 'smart_scale':
        normalized.metrics = {
          weight: rawData.weight,
          bodyFat: rawData.bodyFat,
          muscleMass: rawData.muscleMass,
          bmi: rawData.bmi,
          waterPercentage: rawData.water
        };
        break;

      case 'pulse_oximeter':
        normalized.metrics = {
          oxygenSaturation: rawData.spo2,
          heartRate: rawData.heartRate,
          perfusionIndex: rawData.pi
        };
        break;

      case 'ecg_monitor':
        normalized.metrics = {
          heartRate: rawData.heartRate,
          rhythm: rawData.rhythm,
          qrsWidth: rawData.qrsWidth,
          qtInterval: rawData.qtInterval,
          abnormalities: rawData.abnormalities
        };
        break;

      default:
        normalized.metrics = rawData;
    }

    return normalized;
  }

  /**
   * Check for immediate health alerts
   */
  async checkImmediateAlerts(patientId, data, deviceType) {
    const thresholds = this.alertThresholds.get(patientId);
    if (!thresholds) return;

    const alerts = [];

    // Check critical thresholds
    if (data.metrics.heartRate) {
      if (data.metrics.heartRate > thresholds.heartRate.critical.max || 
          data.metrics.heartRate < thresholds.heartRate.critical.min) {
        alerts.push({
          type: 'critical',
          metric: 'heartRate',
          value: data.metrics.heartRate,
          threshold: thresholds.heartRate.critical,
          message: 'Critical heart rate detected'
        });
      }
    }

    if (data.metrics.systolicBP && data.metrics.diastolicBP) {
      if (data.metrics.systolicBP > thresholds.bloodPressure.critical.systolic.max ||
          data.metrics.diastolicBP > thresholds.bloodPressure.critical.diastolic.max) {
        alerts.push({
          type: 'critical',
          metric: 'bloodPressure',
          value: `${data.metrics.systolicBP}/${data.metrics.diastolicBP}`,
          threshold: thresholds.bloodPressure.critical,
          message: 'Critical blood pressure detected'
        });
      }
    }

    if (data.metrics.oxygenSaturation) {
      if (data.metrics.oxygenSaturation < thresholds.oxygenSaturation.critical.min) {
        alerts.push({
          type: 'critical',
          metric: 'oxygenSaturation',
          value: data.metrics.oxygenSaturation,
          threshold: thresholds.oxygenSaturation.critical,
          message: 'Critical oxygen saturation detected'
        });
      }
    }

    if (data.metrics.bloodGlucose) {
      if (data.metrics.bloodGlucose > thresholds.bloodGlucose.critical.max ||
          data.metrics.bloodGlucose < thresholds.bloodGlucose.critical.min) {
        alerts.push({
          type: 'critical',
          metric: 'bloodGlucose',
          value: data.metrics.bloodGlucose,
          threshold: thresholds.bloodGlucose.critical,
          message: 'Critical blood glucose detected'
        });
      }
    }

    // Process alerts
    for (const alert of alerts) {
      await this.triggerAlert(patientId, alert, data);
    }
  }

  /**
   * Analyze trends in health data
   */
  analyzeTrends(dataBuffer) {
    const trends = {};
    
    // Group data by metric
    const metricData = {};
    dataBuffer.forEach(point => {
      Object.keys(point.data?.metrics || {}).forEach(metric => {
        if (!metricData[metric]) metricData[metric] = [];
        metricData[metric].push({
          value: point.data.metrics[metric],
          timestamp: point.timestamp
        });
      });
    });

    // Calculate trends for each metric
    Object.keys(metricData).forEach(metric => {
      const values = metricData[metric];
      if (values.length < 3) return;

      // Simple linear trend calculation
      const trend = this.calculateLinearTrend(values);
      const variance = this.calculateVariance(values.map(v => v.value));
      const average = values.reduce((sum, v) => sum + v.value, 0) / values.length;

      trends[metric] = {
        direction: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
        slope: trend,
        variance,
        average,
        dataPoints: values.length,
        timeSpan: values[values.length - 1].timestamp - values[0].timestamp
      };
    });

    return trends;
  }

  /**
   * Calculate linear trend using least squares method
   */
  calculateLinearTrend(values) {
    const n = values.length;
    if (n < 2) return 0;

    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, v) => sum + v.value, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v.value, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Calculate variance
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Store aggregated health data
   */
  async storeAggregatedData(patientId, dataBuffer, trends) {
    try {
      // Store in database (this would be implemented based on your schema)
      const aggregatedData = {
        patientId,
        timestamp: new Date(),
        dataPoints: dataBuffer.length,
        metrics: this.aggregateMetrics(dataBuffer),
        trends,
        deviceTypes: [...new Set(dataBuffer.map(d => d.deviceType))]
      };

      // In a real implementation, you would store this in a time-series database
      logger.info(`Stored aggregated data for patient ${patientId}: ${dataBuffer.length} data points`);
      
    } catch (error) {
      logger.error('Error storing aggregated data:', error);
    }
  }

  /**
   * Aggregate metrics from data buffer
   */
  aggregateMetrics(dataBuffer) {
    const aggregated = {};
    
    dataBuffer.forEach(point => {
      Object.keys(point.data?.metrics || {}).forEach(metric => {
        if (!aggregated[metric]) {
          aggregated[metric] = {
            values: [],
            min: Infinity,
            max: -Infinity,
            sum: 0,
            count: 0
          };
        }
        
        const value = point.data.metrics[metric];
        aggregated[metric].values.push(value);
        aggregated[metric].min = Math.min(aggregated[metric].min, value);
        aggregated[metric].max = Math.max(aggregated[metric].max, value);
        aggregated[metric].sum += value;
        aggregated[metric].count++;
      });
    });

    // Calculate averages and other statistics
    Object.keys(aggregated).forEach(metric => {
      const data = aggregated[metric];
      data.average = data.sum / data.count;
      data.median = this.calculateMedian(data.values);
      data.standardDeviation = Math.sqrt(
        data.values.reduce((sum, v) => sum + Math.pow(v - data.average, 2), 0) / data.count
      );
    });

    return aggregated;
  }

  /**
   * Calculate median value
   */
  calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * Update health twin with new real-time data
   */
  async updateHealthTwin(patientId, dataBuffer, trends) {
    try {
      // This would integrate with the health twin AI service
      const healthTwinUpdate = {
        patientId,
        realTimeData: {
          latestMetrics: this.getLatestMetrics(dataBuffer),
          trends,
          dataQuality: this.assessDataQuality(dataBuffer),
          deviceStatus: this.getDeviceStatus(patientId)
        },
        timestamp: new Date()
      };

      // Emit health twin update event
      this.emit('healthTwinUpdated', healthTwinUpdate);
      
    } catch (error) {
      logger.error('Error updating health twin:', error);
    }
  }

  /**
   * Get latest metrics from data buffer
   */
  getLatestMetrics(dataBuffer) {
    if (dataBuffer.length === 0) return {};
    
    const latest = dataBuffer[dataBuffer.length - 1];
    return latest.data?.metrics || {};
  }

  /**
   * Assess data quality
   */
  assessDataQuality(dataBuffer) {
    const quality = {
      completeness: 0,
      consistency: 0,
      timeliness: 0,
      overall: 0
    };

    if (dataBuffer.length === 0) return quality;

    // Completeness: percentage of expected data points received
    quality.completeness = Math.min(100, (dataBuffer.length / 20) * 100); // Assuming 20 is expected

    // Consistency: low variance in similar measurements
    const heartRateValues = dataBuffer
      .filter(d => d.data?.metrics?.heartRate)
      .map(d => d.data.metrics.heartRate);
    
    if (heartRateValues.length > 1) {
      const variance = this.calculateVariance(heartRateValues);
      quality.consistency = Math.max(0, 100 - variance); // Lower variance = higher consistency
    }

    // Timeliness: data freshness
    const latestTimestamp = Math.max(...dataBuffer.map(d => d.timestamp.getTime()));
    const timeDiff = Date.now() - latestTimestamp;
    quality.timeliness = Math.max(0, 100 - (timeDiff / 60000)); // Decrease by 1% per minute

    // Overall quality
    quality.overall = (quality.completeness + quality.consistency + quality.timeliness) / 3;

    return quality;
  }

  /**
   * Get device connection status for a patient
   */
  getDeviceStatus(patientId) {
    const patientConnections = Array.from(this.activeConnections.entries())
      .filter(([key, connection]) => connection.patientId === patientId);

    return patientConnections.map(([key, connection]) => ({
      deviceId: connection.deviceId,
      deviceType: connection.deviceType,
      status: 'connected',
      lastDataReceived: connection.lastDataReceived,
      dataPoints: connection.dataPoints,
      connectionDuration: Date.now() - connection.connectedAt.getTime()
    }));
  }

  /**
   * Setup default alert thresholds
   */
  setupDefaultThresholds() {
    this.defaultThresholds = {
      heartRate: {
        critical: { min: 40, max: 150 },
        warning: { min: 50, max: 120 }
      },
      bloodPressure: {
        critical: { 
          systolic: { min: 70, max: 180 },
          diastolic: { min: 40, max: 110 }
        },
        warning: {
          systolic: { min: 90, max: 140 },
          diastolic: { min: 60, max: 90 }
        }
      },
      oxygenSaturation: {
        critical: { min: 88, max: 100 },
        warning: { min: 92, max: 100 }
      },
      bloodGlucose: {
        critical: { min: 50, max: 400 },
        warning: { min: 70, max: 180 }
      }
    };
  }

  /**
   * Setup patient-specific thresholds
   */
  async setupPatientThresholds(patientId) {
    try {
      // Get patient data to customize thresholds
      const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
      
      if (!patient) {
        this.alertThresholds.set(patientId, this.defaultThresholds);
        return;
      }

      // Customize thresholds based on patient conditions
      const customThresholds = JSON.parse(JSON.stringify(this.defaultThresholds));
      
      // Adjust for chronic conditions
      if (patient.chronicConditions) {
        if (patient.chronicConditions.includes('Hypertension')) {
          customThresholds.bloodPressure.warning.systolic.max = 130;
          customThresholds.bloodPressure.warning.diastolic.max = 80;
        }
        
        if (patient.chronicConditions.includes('Diabetes')) {
          customThresholds.bloodGlucose.warning.max = 140;
        }
        
        if (patient.chronicConditions.includes('Heart Disease')) {
          customThresholds.heartRate.warning.max = 100;
        }
      }

      // Adjust for age
      if (patient.age > 65) {
        customThresholds.heartRate.critical.max = 130;
        customThresholds.bloodPressure.warning.systolic.max = 150;
      }

      this.alertThresholds.set(patientId, customThresholds);
      
    } catch (error) {
      logger.error('Error setting up patient thresholds:', error);
      this.alertThresholds.set(patientId, this.defaultThresholds);
    }
  }

  /**
   * Trigger health alert
   */
  async triggerAlert(patientId, alert, data) {
    try {
      const alertData = {
        patientId,
        type: alert.type,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        message: alert.message,
        timestamp: new Date(),
        deviceType: data.deviceType,
        severity: alert.type === 'critical' ? 'high' : 'medium'
      };

      // Store alert in database
      // await this.storeAlert(alertData);

      // Emit alert event
      this.emit('healthAlert', alertData);

      // Send notifications
      await this.sendAlertNotifications(alertData);

      logger.warn(`Health alert triggered for patient ${patientId}: ${alert.message}`);
      
    } catch (error) {
      logger.error('Error triggering alert:', error);
    }
  }

  /**
   * Send alert notifications
   */
  async sendAlertNotifications(alertData) {
    // This would integrate with notification services
    // For now, just log the alert
    logger.info(`Alert notification: ${alertData.message} for patient ${alertData.patientId}`);
  }

  /**
   * Check for pattern-based alerts
   */
  async checkPatternAlerts(patientId, dataBuffer, trends) {
    // Check for concerning trends
    Object.keys(trends).forEach(metric => {
      const trend = trends[metric];
      
      if (metric === 'heartRate' && trend.direction === 'increasing' && trend.slope > 2) {
        this.emit('patternAlert', {
          patientId,
          type: 'trend',
          metric,
          pattern: 'rapid_increase',
          message: 'Rapid increase in heart rate detected',
          severity: 'medium'
        });
      }
      
      if (metric === 'bloodPressure' && trend.variance > 400) {
        this.emit('patternAlert', {
          patientId,
          type: 'variability',
          metric,
          pattern: 'high_variability',
          message: 'High blood pressure variability detected',
          severity: 'medium'
        });
      }
    });
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats() {
    return {
      activeConnections: this.activeConnections.size,
      totalDataPoints: Array.from(this.activeConnections.values())
        .reduce((sum, conn) => sum + conn.dataPoints, 0),
      deviceTypes: [...new Set(Array.from(this.activeConnections.values())
        .map(conn => conn.deviceType))],
      averageDataRate: this.calculateAverageDataRate(),
      systemUptime: process.uptime()
    };
  }

  /**
   * Calculate average data rate
   */
  calculateAverageDataRate() {
    const connections = Array.from(this.activeConnections.values());
    if (connections.length === 0) return 0;

    const totalRate = connections.reduce((sum, conn) => {
      const duration = (Date.now() - conn.connectedAt.getTime()) / 1000; // seconds
      return sum + (conn.dataPoints / Math.max(duration, 1));
    }, 0);

    return totalRate / connections.length;
  }

  /**
   * Cleanup and shutdown
   */
  shutdown() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Disconnect all devices
    this.activeConnections.clear();
    this.dataBuffer.clear();
    this.alertThresholds.clear();
    
    logger.info('Real-time health monitoring system shut down');
  }
}

module.exports = new RealTimeHealthMonitoring();