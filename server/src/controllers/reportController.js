const { allQuery } = require('../config/database');
const { app: logger } = require('../services/logger');

/**
 * Generate a patient statistics report
 */
const generatePatientReport = async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Convert string dates to timestamps
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
    }
    
    // Base query
    let query = `
      SELECT 
        COUNT(*) as totalPatients,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as maleCount,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as femaleCount,
        SUM(CASE WHEN gender = 'other' THEN 1 ELSE 0 END) as otherCount,
        AVG(age) as averageAge,
        MIN(age) as minAge,
        MAX(age) as maxAge
      FROM patients
      WHERE createdAt BETWEEN ? AND ?
    `;
    
    let params = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      query += ' AND address LIKE ?';
      params.push(`%${location}%`);
    }
    
    const [patientStats] = await allQuery(query, params);
    
    // Get age distribution
    const ageDistribution = await allQuery(`
      SELECT 
        CASE 
          WHEN age BETWEEN 0 AND 18 THEN '0-18'
          WHEN age BETWEEN 19 AND 35 THEN '19-35'
          WHEN age BETWEEN 36 AND 50 THEN '36-50'
          WHEN age BETWEEN 51 AND 65 THEN '51-65'
          ELSE '65+'
        END as ageGroup,
        COUNT(*) as count
      FROM patients
      WHERE createdAt BETWEEN ? AND ?
      ${location ? 'AND address LIKE ?' : ''}
      GROUP BY ageGroup
      ORDER BY ageGroup
    `, location ? [startTimestamp, endTimestamp, `%${location}%`] : [startTimestamp, endTimestamp]);
    
    // Get common medical conditions
    const medicalConditions = await allQuery(`
      SELECT 
        json_each.value as condition,
        COUNT(*) as count
      FROM patients, json_each(medicalHistory)
      WHERE createdAt BETWEEN ? AND ?
      ${location ? 'AND address LIKE ?' : ''}
      GROUP BY condition
      ORDER BY count DESC
      LIMIT 10
    `, location ? [startTimestamp, endTimestamp, `%${location}%`] : [startTimestamp, endTimestamp]);
    
    res.json({
      reportType: 'Patient Statistics',
      timeframe: {
        startDate,
        endDate
      },
      location: location || 'All Locations',
      statistics: patientStats,
      ageDistribution,
      commonMedicalConditions: medicalConditions
    });
  } catch (error) {
    logger.error('Error generating patient report:', error);
    res.status(500).json({ message: 'Failed to generate patient report due to an internal error.' });
  }
};

/**
 * Generate a symptom statistics report
 */
const generateSymptomReport = async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Convert string dates to timestamps
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
    }
    
    // Get total symptom checks
    let countQuery = `
      SELECT COUNT(*) as totalChecks
      FROM symptomChecks
      WHERE timestamp BETWEEN ? AND ?
    `;
    
    let countParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      countQuery += ' AND location LIKE ?';
      countParams.push(`%${location}%`);
    }
    
    const [totalStats] = await allQuery(countQuery, countParams);
    
    // Get top symptoms
    let symptomQuery = `
      SELECT 
        symptoms_json.value AS symptom,
        COUNT(*) AS count
      FROM symptomChecks,
      json_each(symptoms) AS symptoms_json
      WHERE timestamp BETWEEN ? AND ?
    `;
    
    let symptomParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      symptomQuery += ' AND location LIKE ?';
      symptomParams.push(`%${location}%`);
    }
    
    symptomQuery += `
      GROUP BY symptom
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const topSymptoms = await allQuery(symptomQuery, symptomParams);
    
    // Get symptom severity distribution
    let severityQuery = `
      SELECT 
        severity,
        COUNT(*) AS count
      FROM symptomChecks
      WHERE timestamp BETWEEN ? AND ?
    `;
    
    let severityParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      severityQuery += ' AND location LIKE ?';
      severityParams.push(`%${location}%`);
    }
    
    severityQuery += `
      GROUP BY severity
      ORDER BY 
        CASE 
          WHEN severity = 'low' THEN 1
          WHEN severity = 'medium' THEN 2
          WHEN severity = 'high' THEN 3
          ELSE 4
        END
    `;
    
    const severityDistribution = await allQuery(severityQuery, severityParams);
    
    // Get daily trend
    let trendQuery = `
      SELECT 
        date(timestamp/1000, 'unixepoch') as day,
        COUNT(*) as count
      FROM symptomChecks
      WHERE timestamp BETWEEN ? AND ?
    `;
    
    let trendParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      trendQuery += ' AND location LIKE ?';
      trendParams.push(`%${location}%`);
    }
    
    trendQuery += `
      GROUP BY day
      ORDER BY day
    `;
    
    const dailyTrend = await allQuery(trendQuery, trendParams);
    
    res.json({
      reportType: 'Symptom Statistics',
      timeframe: {
        startDate,
        endDate
      },
      location: location || 'All Locations',
      statistics: totalStats,
      topSymptoms,
      severityDistribution,
      dailyTrend
    });
  } catch (error) {
    logger.error('Error generating symptom report:', error);
    res.status(500).json({ message: 'Failed to generate symptom report due to an internal error.' });
  }
};

/**
 * Generate an appointment statistics report
 */
const generateAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Convert string dates to timestamps
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
    }
    
    // Get total appointments
    let countQuery = `
      SELECT 
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduledCount,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledCount,
        SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missedCount
      FROM appointments
      WHERE appointmentDate BETWEEN ? AND ?
    `;
    
    let countParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      countQuery += ' AND location LIKE ?';
      countParams.push(`%${location}%`);
    }
    
    const [appointmentStats] = await allQuery(countQuery, countParams);
    
    // Get appointments by type
    let typeQuery = `
      SELECT 
        type,
        COUNT(*) AS count
      FROM appointments
      WHERE appointmentDate BETWEEN ? AND ?
    `;
    
    let typeParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      typeQuery += ' AND location LIKE ?';
      typeParams.push(`%${location}%`);
    }
    
    typeQuery += `
      GROUP BY type
      ORDER BY count DESC
    `;
    
    const appointmentsByType = await allQuery(typeQuery, typeParams);
    
    // Get daily trend
    let trendQuery = `
      SELECT 
        date(appointmentDate/1000, 'unixepoch') as day,
        COUNT(*) as count
      FROM appointments
      WHERE appointmentDate BETWEEN ? AND ?
    `;
    
    let trendParams = [startTimestamp, endTimestamp];
    
    // Add location filter if provided
    if (location) {
      trendQuery += ' AND location LIKE ?';
      trendParams.push(`%${location}%`);
    }
    
    trendQuery += `
      GROUP BY day
      ORDER BY day
    `;
    
    const dailyTrend = await allQuery(trendQuery, trendParams);
    
    res.json({
      reportType: 'Appointment Statistics',
      timeframe: {
        startDate,
        endDate
      },
      location: location || 'All Locations',
      statistics: appointmentStats,
      appointmentsByType,
      dailyTrend
    });
  } catch (error) {
    logger.error('Error generating appointment report:', error);
    res.status(500).json({ message: 'Failed to generate appointment report due to an internal error.' });
  }
};

/**
 * Generate a system usage report
 */
const generateSystemUsageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Convert string dates to timestamps
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
    }
    
    // Get user activity
    const userActivity = await allQuery(`
      SELECT 
        role,
        COUNT(*) as loginCount
      FROM userActivity
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY role
      ORDER BY loginCount DESC
    `, [startTimestamp, endTimestamp]);
    
    // Get feature usage
    const featureUsage = await allQuery(`
      SELECT 
        feature,
        COUNT(*) as usageCount
      FROM featureUsage
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY feature
      ORDER BY usageCount DESC
    `, [startTimestamp, endTimestamp]);
    
    // Get daily active users
    const dailyActiveUsers = await allQuery(`
      SELECT 
        date(timestamp/1000, 'unixepoch') as day,
        COUNT(DISTINCT userId) as uniqueUsers
      FROM userActivity
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY day
      ORDER BY day
    `, [startTimestamp, endTimestamp]);
    
    // Get error rates
    const errorRates = await allQuery(`
      SELECT 
        date(timestamp/1000, 'unixepoch') as day,
        COUNT(*) as errorCount
      FROM errorLogs
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY day
      ORDER BY day
    `, [startTimestamp, endTimestamp]);
    
    res.json({
      reportType: 'System Usage Statistics',
      timeframe: {
        startDate,
        endDate
      },
      userActivity,
      featureUsage,
      dailyActiveUsers,
      errorRates
    });
  } catch (error) {
    logger.error('Error generating system usage report:', error);
    res.status(500).json({ message: 'Failed to generate system usage report due to an internal error.' });
  }
};

module.exports = {
  generatePatientReport,
  generateSymptomReport,
  generateAppointmentReport,
  generateSystemUsageReport
};