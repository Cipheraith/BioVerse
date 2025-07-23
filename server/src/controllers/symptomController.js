const { runQuery, getQuery, allQuery } = require("../config/database");
const { analyzeSymptoms } = require("../services/aiService");
const { sendToRole } = require("../services/socketService");
const { logger } = require("../services/logger");

const getSymptomChecksByPatientId = async (req, res) => {
  try {
    const patientId = req.params.id;
    const checks = await allQuery(
      "SELECT * FROM symptomChecks WHERE patientId = $1",
      [patientId],
    );
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res
        .status(403)
        .json({
          message:
            "Access Denied: Patients can only view their own symptom checks.",
        });
    }
    res.json(
      checks.map((c) => ({
        ...c,
        symptoms: JSON.parse(c.symptoms || "[]"),
      })),
    );
  } catch (error) {
    logger.error("Error fetching symptom checks:", error);
    res.status(500).json({ message: "Failed to retrieve symptom checks due to an internal error." });
  }
};

const createSymptomCheck = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { symptoms } = req.body;

    if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
      return res.status(400).json({ message: "Missing symptoms" });
    }

    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res
        .status(403)
        .json({
          message:
            "Access Denied: Patients can only add symptom checks for themselves.",
        });
    }

    // Get patient information for AI analysis
    const patient = await getQuery("SELECT * FROM patients WHERE id = $1", [
      patientId,
    ]);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Prepare symptoms for analysis
    const symptomText = Array.isArray(symptoms)
      ? symptoms.join(", ")
      : symptoms;

    // Store symptom check first
    const newSymptomCheck = {
      patientId,
      symptoms: JSON.stringify(Array.isArray(symptoms) ? symptoms : [symptoms]),
      timestamp: Date.now(),
    };

    const result = await runQuery(
      `INSERT INTO symptomChecks (patientId, symptoms, timestamp) VALUES ($1, $2, $3) RETURNING id`,
      Object.values(newSymptomCheck),
    );

    // Get AI analysis
    let aiDiagnosis = null;
    try {
      const patientContext = {
        age: patient.age,
        gender: patient.gender,
        medicalHistory: JSON.parse(patient.medicalHistory || "[]"),
        chronicConditions: JSON.parse(patient.chronicConditions || "[]"),
        allergies: JSON.parse(patient.allergies || "[]"),
        medications: JSON.parse(patient.medications || "[]"),
        riskFactors: JSON.parse(patient.riskFactors || "[]"),
      };

      aiDiagnosis = await analyzeSymptoms(symptomText, patientContext);
      logger.info(
        `AI analysis completed for patient ${patientId}: ${aiDiagnosis.primaryDiagnosis}`,
      );

      // Send real-time notification to health workers if high severity
      if (
        aiDiagnosis.severity === "high" ||
        aiDiagnosis.severity === "critical"
      ) {
        const alertData = {
          patientId,
          patientName: patient.name,
          symptoms: symptomText,
          diagnosis: aiDiagnosis.primaryDiagnosis,
          severity: aiDiagnosis.severity,
          recommendations: aiDiagnosis.recommendations,
          timestamp: new Date(),
        };

        sendToRole("health_worker", "symptom:alert", alertData);
        sendToRole("moh", "symptom:alert", alertData);
      }
    } catch (aiError) {
      logger.error(`AI analysis failed for patient ${patientId}:`, aiError);
      aiDiagnosis = {
        primaryDiagnosis: "Unable to analyze symptoms at this time",
        severity: "unknown",
        recommendations: ["Please consult with a healthcare provider"],
        confidence: 0,
      };
    }

    const response = {
      ...newSymptomCheck,
      id: result.id,
      diagnosis: aiDiagnosis.primaryDiagnosis,
      severity: aiDiagnosis.severity,
      recommendations: aiDiagnosis.recommendations,
      confidence: aiDiagnosis.confidence,
      aiAnalysis: aiDiagnosis,
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error("Error adding symptom check:", error);
    res.status(500).json({ message: "Failed to process symptom check due to an internal error." });
  }
};

const getSymptomTrends = async (req, res) => {
  try {
                                

    let timeframe = req.query.timeframe || "7d";
    let location = req.query.location;

    // Calculate time range based on timeframe
    const now = Date.now();
    let startTime;

    switch (timeframe) {
      case "24h":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "7d":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 7 * 24 * 60 * 60 * 1000;
    }

    // Get symptom checks within timeframe
    let query = "SELECT sc.symptoms, sc.timestamp, p.address FROM symptomChecks sc JOIN patients p ON sc.patientId = p.id WHERE sc.timestamp >= $1";
    let params = [startTime];

    if (location) {
      query += " AND p.address = $2";
      params.push(location);
    }

    const symptomChecks = await allQuery(query, params);

    // If no symptom checks found, return empty data immediately
    if (symptomChecks.length === 0) {
      return res.json({
        trends: [],
        locationTrends: [],
        timeSeriesData: {},
        insights: [],
        metadata: {
          totalChecks: 0,
          timeframe,
          uniqueSymptoms: 0,
          generatedAt: new Date().toISOString(),
        },
      });
    }

    const symptomCounts = {};
    const locationCounts = {};
    const timeSeriesData = {};

    symptomChecks.forEach((check) => {
      try {
        logger.debug(`Symptom check: ${JSON.stringify(check)}`);
        const symptoms = typeof check.symptoms === 'string' ? JSON.parse(check.symptoms || "[]") : (check.symptoms || []);
        
        // Handle timestamp with robust error checking
        let timestamp;
        if (typeof check.timestamp === 'number') {
          timestamp = check.timestamp;
        } else if (check.timestamp) {
          timestamp = new Date(check.timestamp).getTime();
        } else {
          // Default to current time if no valid timestamp
          timestamp = Date.now();
        }
        
        // Validate timestamp is valid
        if (isNaN(timestamp)) {
          logger.warn(`Invalid timestamp for symptom check, skipping: ${JSON.stringify(check)}`);
          return; // Skip this record
        }
        
        const checkDate = new Date(timestamp).toISOString().split("T")[0];

      symptoms.forEach((symptom) => {
        // Overall symptom counts
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;

        // Location-based counts
        if (check.address) {
          const locationKey = `${symptom}:${check.address}`;
          locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
        }

        // Time series data
        if (!timeSeriesData[symptom]) {
          timeSeriesData[symptom] = {};
        }
        timeSeriesData[symptom][checkDate] =
          (timeSeriesData[symptom][checkDate] || 0) + 1;
      });
      } catch (checkError) {
        logger.warn(`Error processing symptom check, skipping: ${checkError.message}`);
      }
    });

    // Format trends
    const trends = Object.keys(symptomCounts)
      .map((symptom) => ({
        symptom: symptom,
        count: symptomCounts[symptom],
        percentage: (
          (symptomCounts[symptom] / symptomChecks.length) *
          100
        ).toFixed(1),
        trend: calculateTrend(timeSeriesData[symptom]),
      }))
      .sort((a, b) => b.count - a.count);

    // Format location data
    const locationTrends = Object.keys(locationCounts)
      .map((key) => {
        const [symptom, location] = key.split(":");
        return {
          symptom,
          location,
          count: locationCounts[key],
        };
      })
      .sort((a, b) => b.count - a.count);

    // Generate insights
    const insights = generateHealthInsights(trends, locationTrends, timeframe);

    res.json({
      trends,
      locationTrends,
      timeSeriesData,
      insights,
      metadata: {
        totalChecks: symptomChecks.length,
        timeframe,
        uniqueSymptoms: Object.keys(symptomCounts).length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching symptom trends:", error);
    res.status(500).json({ message: "Failed to retrieve symptom trends due to an internal error." });
  }
};

// Helper function to calculate trend direction
const calculateTrend = (timeSeriesData) => {
  if (!timeSeriesData || Object.keys(timeSeriesData).length < 2) {
    return "stable";
  }

  const dates = Object.keys(timeSeriesData).sort();
  const recentHalf = dates.slice(Math.floor(dates.length / 2));
  const earlierHalf = dates.slice(0, Math.floor(dates.length / 2));

  const recentAvg =
    recentHalf.reduce((sum, date) => sum + timeSeriesData[date], 0) /
    recentHalf.length;
  const earlierAvg =
    earlierHalf.reduce((sum, date) => sum + timeSeriesData[date], 0) /
    earlierHalf.length;

  if (recentAvg > earlierAvg * 1.2) return "increasing";
  if (recentAvg < earlierAvg * 0.8) return "decreasing";
  return "stable";
};

// Helper function to generate health insights
const generateHealthInsights = (trends, locationTrends) => {
  const insights = [];

  // Check for potential outbreaks
  const highCountSymptoms = trends.filter(
    (t) => t.count > 10 && t.trend === "increasing",
  );
  if (highCountSymptoms.length > 0) {
    insights.push({
      type: "outbreak_alert",
      severity: "high",
      message: `Potential outbreak detected: ${highCountSymptoms.map((s) => s.symptom).join(", ")} showing increasing trends`,
      data: highCountSymptoms,
    });
  }

  // Check for seasonal patterns
  const commonColdSymptoms = trends.filter((t) =>
    ["cough", "fever", "sore throat", "runny nose", "headache"].includes(
      t.symptom.toLowerCase(),
    ),
  );
  if (commonColdSymptoms.length >= 3) {
    insights.push({
      type: "seasonal_pattern",
      severity: "medium",
      message:
        "Common cold symptoms detected. Consider public health advisories.",
      data: commonColdSymptoms,
    });
  }

  // Check for location-specific clusters
  const locationClusters = {};
  locationTrends.forEach((lt) => {
    if (!locationClusters[lt.location]) {
      locationClusters[lt.location] = [];
    }
    locationClusters[lt.location].push(lt);
  });

  Object.keys(locationClusters).forEach((location) => {
    const cluster = locationClusters[location];
    if (cluster.length >= 3) {
      insights.push({
        type: "location_cluster",
        severity: "medium",
        message: `Health cluster detected in ${location}`,
        data: cluster,
      });
    }
  });

  return insights;
};

// New endpoint for getting AI symptom analysis
const getSymptomAnalysis = async (req, res) => {
  try {
    const { symptoms, patientId } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Symptoms are required" });
    }

    let patientContext = {};

    // Get patient context if patientId is provided
    if (patientId) {
      if (req.user.role === "patient" && req.user.id !== patientId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const patient = await getQuery("SELECT * FROM patients WHERE id = $1", [
        patientId,
      ]);
      if (patient) {
        patientContext = {
          age: patient.age,
          gender: patient.gender,
          medicalHistory: JSON.parse(patient.medicalHistory || "[]"),
          chronicConditions: JSON.parse(patient.chronicConditions || "[]"),
          allergies: JSON.parse(patient.allergies || "[]"),
          medications: JSON.parse(patient.medications || "[]"),
          riskFactors: JSON.parse(patient.riskFactors || "[]"),
        };
      }
    }

    const symptomText = Array.isArray(symptoms)
      ? symptoms.join(", ")
      : symptoms;
    const analysis = await analyzeSymptoms(symptomText, patientContext);

    logger.info(`AI analysis completed for symptoms: ${symptomText}`);

    res.json({
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error in symptom analysis:", error);
    res.status(500).json({
      message: "Failed to analyze symptoms due to an internal error.",
      analysis: {
        primaryDiagnosis: "Unable to analyze symptoms at this time",
        severity: "unknown",
        recommendations: ["Please consult with a healthcare provider"],
        confidence: 0,
      },
    });
  }
};

const getMySymptoms = async (req, res) => {
  try {
    const checks = await allQuery(
      "SELECT * FROM symptomChecks WHERE patientId = $1",
      [req.user.id],
    );
    res.json(
      checks.map((c) => ({
        ...c,
        symptoms: JSON.parse(c.symptoms || "[]"),
      })),
    );
  } catch (error) {
    logger.error("Error fetching symptom checks:", error);
    res.status(500).json({ message: "Failed to retrieve symptom checks due to an internal error." });
  }
};

module.exports = {
  getSymptomChecksByPatientId,
  createSymptomCheck,
  getSymptomTrends,
  getSymptomAnalysis,
  getMySymptoms,
};
