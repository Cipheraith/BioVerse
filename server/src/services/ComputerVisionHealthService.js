const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { logger } = require('./logger');
const { DatabaseService } = require('./databaseService');

class ComputerVisionHealthService {
  constructor() {
    this.databaseService = new DatabaseService();
    this.tempDir = path.join(__dirname, '../../temp/cv');
    this.modelsLoaded = false;
    this.supportedImageTypes = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];
    this.initializeService();
  }

  async initializeService() {
    try {
      this.initializeTempDir();
      await this.loadModels();
      logger.info('Computer Vision Health Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Computer Vision Health Service', { error: error.message });
    }
  }

  initializeTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async loadModels() {
    try {
      logger.info('Loading computer vision models for health screening');

      // Mock model loading - in production, this would load actual AI models
      this.models = {
        dermatology: {
          name: 'DermAI-v2.1',
          loaded: true,
          accuracy: 0.94,
          classes: ['melanoma', 'basal_cell_carcinoma', 'squamous_cell_carcinoma', 'actinic_keratosis', 'benign_nevus', 'seborrheic_keratosis']
        },
        ophthalmology: {
          name: 'EyeHealth-AI',
          loaded: true,
          accuracy: 0.91,
          classes: ['diabetic_retinopathy', 'glaucoma', 'macular_degeneration', 'cataracts', 'healthy']
        },
        radiology: {
          name: 'RadiologyAI-Pro',
          loaded: true,
          accuracy: 0.96,
          classes: ['pneumonia', 'covid19', 'tuberculosis', 'lung_cancer', 'normal']
        },
        cardiology: {
          name: 'CardioVision',
          loaded: true,
          accuracy: 0.89,
          classes: ['arrhythmia', 'myocardial_infarction', 'heart_failure', 'normal']
        },
        general: {
          name: 'HealthVision-General',
          loaded: true,
          accuracy: 0.87,
          classes: ['abnormal', 'normal', 'requires_specialist']
        }
      };

      this.modelsLoaded = true;
      logger.info('All computer vision models loaded successfully');

    } catch (error) {
      logger.error('Failed to load computer vision models', { error: error.message });
      throw new Error(`Model loading failed: ${error.message}`);
    }
  }

  async analyzeImage(imagePath, analysisType = 'general', options = {}) {
    try {
      if (!this.modelsLoaded) {
        await this.loadModels();
      }

      logger.info('Starting image analysis', { imagePath, analysisType });

      // Validate image
      await this.validateImage(imagePath);

      // Preprocess image
      const preprocessedImage = await this.preprocessImage(imagePath, analysisType);

      // Perform analysis based on type
      let analysisResult;
      switch (analysisType.toLowerCase()) {
        case 'dermatology':
          analysisResult = await this.analyzeSkinImage(preprocessedImage, options);
          break;
        case 'ophthalmology':
          analysisResult = await this.analyzeEyeImage(preprocessedImage, options);
          break;
        case 'radiology':
          analysisResult = await this.analyzeRadiologyImage(preprocessedImage, options);
          break;
        case 'cardiology':
          analysisResult = await this.analyzeCardiacImage(preprocessedImage, options);
          break;
        default:
          analysisResult = await this.performGeneralHealthScreening(preprocessedImage, options);
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(analysisResult, analysisType);

      // Calculate confidence and risk scores
      const riskAssessment = this.calculateRiskAssessment(analysisResult);

      const result = {
        analysisType,
        timestamp: new Date().toISOString(),
        analysisResult,
        recommendations,
        riskAssessment,
        confidence: analysisResult.confidence || 0.85,
        model: this.models[analysisType] || this.models.general,
        metadata: {
          imagePath: path.basename(imagePath),
          imageSize: this.getImageStats(imagePath),
          processingTime: Date.now()
        }
      };

      logger.info('Image analysis completed successfully', {
        analysisType,
        confidence: result.confidence,
        riskLevel: riskAssessment.level
      });

      return result;

    } catch (error) {
      logger.error('Image analysis failed', { error: error.message, imagePath, analysisType });
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  async validateImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file does not exist');
    }

    const stats = fs.statSync(imagePath);
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (stats.size > maxSize) {
      throw new Error('Image file too large. Maximum size is 50MB');
    }

    const ext = path.extname(imagePath).toLowerCase().substring(1);
    if (!this.supportedImageTypes.includes(ext)) {
      throw new Error(`Unsupported image format: ${ext}. Supported formats: ${this.supportedImageTypes.join(', ')}`);
    }
  }

  async preprocessImage(imagePath, analysisType) {
    try {
      logger.info('Preprocessing image for analysis', { imagePath, analysisType });

      // Mock preprocessing - in production, this would use actual image processing libraries
      const imageStats = this.getImageStats(imagePath);

      const preprocessedData = {
        originalPath: imagePath,
        dimensions: imageStats.dimensions,
        colorSpace: 'RGB',
        normalized: true,
        enhanced: analysisType !== 'general',
        noiseReduced: true,
        contrastAdjusted: analysisType === 'radiology',
        segmented: analysisType === 'dermatology',
        features: this.extractImageFeatures(imagePath, analysisType)
      };

      logger.info('Image preprocessing completed', {
        dimensions: preprocessedData.dimensions,
        enhanced: preprocessedData.enhanced
      });

      return preprocessedData;

    } catch (error) {
      logger.error('Image preprocessing failed', { error: error.message });
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  async analyzeSkinImage(preprocessedImage, options = {}) {
    try {
      logger.info('Performing dermatological analysis');

      // Mock AI analysis for skin conditions
      const findings = this.simulateSkinAnalysis(preprocessedImage);

      return {
        primaryFinding: findings.primary,
        confidence: findings.confidence,
        additionalFindings: findings.additional,
        asymmetry: findings.asymmetry,
        borderIrregularity: findings.border,
        colorVariation: findings.color,
        diameter: findings.diameter,
        evolution: findings.evolution,
        abcdeScore: findings.abcdeScore,
        malignancyRisk: findings.malignancyRisk,
        urgency: findings.urgency,
        lesionCharacteristics: {
          size: findings.size,
          shape: findings.shape,
          texture: findings.texture,
          location: options.bodyPart || 'unspecified'
        }
      };

    } catch (error) {
      logger.error('Skin analysis failed', { error: error.message });
      throw new Error(`Dermatological analysis failed: ${error.message}`);
    }
  }

  async analyzeEyeImage(preprocessedImage, options = {}) {
    try {
      logger.info('Performing ophthalmological analysis');

      const findings = this.simulateEyeAnalysis(preprocessedImage);

      return {
        primaryCondition: findings.condition,
        confidence: findings.confidence,
        severity: findings.severity,
        affectedAreas: findings.areas,
        visionThreat: findings.visionThreat,
        diabeticRetinopathyGrade: findings.drGrade,
        glaucomaRisk: findings.glaucomaRisk,
        macularHealth: findings.macularHealth,
        vascularAbnormalities: findings.vascular,
        recommendations: findings.clinicalRecommendations,
        followUpRequired: findings.followUp
      };

    } catch (error) {
      logger.error('Eye analysis failed', { error: error.message });
      throw new Error(`Ophthalmological analysis failed: ${error.message}`);
    }
  }

  async analyzeRadiologyImage(preprocessedImage, options = {}) {
    try {
      logger.info('Performing radiological analysis');

      const findings = this.simulateRadiologyAnalysis(preprocessedImage, options.imageType);

      return {
        imageType: options.imageType || 'chest_xray',
        primaryFinding: findings.primary,
        confidence: findings.confidence,
        abnormalities: findings.abnormalities,
        organSystems: findings.organs,
        pathologyDetected: findings.pathology,
        urgencyLevel: findings.urgency,
        comparativeFinding: findings.comparison,
        technicalQuality: findings.quality,
        measurements: findings.measurements,
        followUpRecommended: findings.followUp
      };

    } catch (error) {
      logger.error('Radiology analysis failed', { error: error.message });
      throw new Error(`Radiological analysis failed: ${error.message}`);
    }
  }

  async analyzeCardiacImage(preprocessedImage, options = {}) {
    try {
      logger.info('Performing cardiac image analysis');

      const findings = this.simulateCardiacAnalysis(preprocessedImage);

      return {
        rhythmAnalysis: findings.rhythm,
        confidence: findings.confidence,
        heartRate: findings.heartRate,
        abnormalities: findings.abnormalities,
        riskFactors: findings.riskFactors,
        cardiacFunction: findings.function,
        recommendations: findings.recommendations,
        urgency: findings.urgency
      };

    } catch (error) {
      logger.error('Cardiac analysis failed', { error: error.message });
      throw new Error(`Cardiac analysis failed: ${error.message}`);
    }
  }

  async performGeneralHealthScreening(preprocessedImage, options = {}) {
    try {
      logger.info('Performing general health screening');

      const screening = this.simulateGeneralScreening(preprocessedImage);

      return {
        overallAssessment: screening.assessment,
        confidence: screening.confidence,
        abnormalitiesDetected: screening.abnormalities,
        bodySystemsAnalyzed: screening.systems,
        healthIndicators: screening.indicators,
        riskFactors: screening.risks,
        recommendedSpecialists: screening.specialists,
        followUpRequired: screening.followUp
      };

    } catch (error) {
      logger.error('General screening failed', { error: error.message });
      throw new Error(`General health screening failed: ${error.message}`);
    }
  }

  // Simulation methods for different types of analysis
  simulateSkinAnalysis(preprocessedImage) {
    const lesionTypes = ['benign_nevus', 'seborrheic_keratosis', 'melanoma', 'basal_cell_carcinoma', 'actinic_keratosis'];
    const primary = lesionTypes[Math.floor(Math.random() * lesionTypes.length)];
    const isMalignant = ['melanoma', 'basal_cell_carcinoma'].includes(primary);

    return {
      primary,
      confidence: Math.random() * 0.3 + 0.7,
      additional: Math.random() > 0.7 ? ['inflammation', 'scarring'] : [],
      asymmetry: Math.random() * 10,
      border: Math.random() * 10,
      color: Math.random() * 10,
      diameter: Math.random() * 20 + 2,
      evolution: Math.random() > 0.8,
      abcdeScore: Math.random() * 50,
      malignancyRisk: isMalignant ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3,
      urgency: isMalignant ? 'high' : Math.random() > 0.8 ? 'medium' : 'low',
      size: Math.random() * 15 + 1,
      shape: ['round', 'oval', 'irregular'][Math.floor(Math.random() * 3)],
      texture: ['smooth', 'rough', 'scaly'][Math.floor(Math.random() * 3)]
    };
  }

  simulateEyeAnalysis(preprocessedImage) {
    const conditions = ['healthy', 'diabetic_retinopathy', 'glaucoma', 'macular_degeneration', 'cataracts'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const isAbnormal = condition !== 'healthy';

    return {
      condition,
      confidence: Math.random() * 0.25 + 0.75,
      severity: isAbnormal ? ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)] : 'none',
      areas: isAbnormal ? ['macula', 'optic_disc', 'periphery'].filter(() => Math.random() > 0.5) : [],
      visionThreat: isAbnormal && Math.random() > 0.6,
      drGrade: condition === 'diabetic_retinopathy' ? Math.floor(Math.random() * 5) : 0,
      glaucomaRisk: condition === 'glaucoma' ? Math.random() * 0.7 + 0.3 : Math.random() * 0.2,
      macularHealth: Math.random() * 0.4 + 0.6,
      vascular: isAbnormal && Math.random() > 0.7,
      clinicalRecommendations: isAbnormal ? ['specialist_referral', 'follow_up'] : ['routine_screening'],
      followUp: isAbnormal
    };
  }

  simulateRadiologyAnalysis(preprocessedImage, imageType = 'chest_xray') {
    const abnormalities = {
      chest_xray: ['pneumonia', 'tuberculosis', 'lung_nodule', 'pleural_effusion', 'pneumothorax'],
      ct_scan: ['mass', 'inflammation', 'structural_abnormality'],
      mri: ['tissue_changes', 'lesion', 'edema']
    };

    const possibleFindings = abnormalities[imageType] || abnormalities.chest_xray;
    const hasAbnormality = Math.random() > 0.6;
    const primary = hasAbnormality ? possibleFindings[Math.floor(Math.random() * possibleFindings.length)] : 'normal';

    return {
      primary,
      confidence: Math.random() * 0.3 + 0.7,
      abnormalities: hasAbnormality ? [primary] : [],
      organs: ['lungs', 'heart', 'mediastinum', 'bones'],
      pathology: hasAbnormality,
      urgency: hasAbnormality && Math.random() > 0.7 ? 'high' : 'routine',
      comparison: 'no_prior_available',
      quality: ['excellent', 'good', 'adequate'][Math.floor(Math.random() * 3)],
      measurements: {
        cardiothoracicRatio: Math.random() * 0.2 + 0.4,
        lungVolume: Math.random() * 2000 + 4000
      },
      followUp: hasAbnormality
    };
  }

  simulateCardiacAnalysis(preprocessedImage) {
    const rhythms = ['normal_sinus', 'atrial_fibrillation', 'tachycardia', 'bradycardia'];
    const rhythm = rhythms[Math.floor(Math.random() * rhythms.length)];
    const isAbnormal = rhythm !== 'normal_sinus';

    return {
      rhythm,
      confidence: Math.random() * 0.25 + 0.75,
      heartRate: Math.random() * 60 + 60,
      abnormalities: isAbnormal ? [rhythm] : [],
      riskFactors: isAbnormal ? ['arrhythmia', 'cardiovascular_disease'] : [],
      function: Math.random() * 0.3 + 0.7,
      recommendations: isAbnormal ? ['cardiology_consultation', 'ecg_monitoring'] : ['routine_monitoring'],
      urgency: isAbnormal && Math.random() > 0.8 ? 'high' : 'routine'
    };
  }

  simulateGeneralScreening(preprocessedImage) {
    const hasAbnormality = Math.random() > 0.7;

    return {
      assessment: hasAbnormality ? 'abnormalities_detected' : 'normal',
      confidence: Math.random() * 0.2 + 0.8,
      abnormalities: hasAbnormality ? ['structural_abnormality', 'color_changes'] : [],
      systems: ['integumentary', 'musculoskeletal', 'vascular'],
      indicators: {
        inflammation: Math.random() * 0.5,
        circulation: Math.random() * 0.3 + 0.7,
        tissue_health: Math.random() * 0.3 + 0.7
      },
      risks: hasAbnormality ? ['requires_monitoring'] : [],
      specialists: hasAbnormality ? ['dermatology', 'internal_medicine'] : [],
      followUp: hasAbnormality
    };
  }

  generateRecommendations(analysisResult, analysisType) {
    const recommendations = [];

    switch (analysisType) {
      case 'dermatology':
        if (analysisResult.malignancyRisk > 0.7) {
          recommendations.push({
            type: 'urgent',
            title: 'Immediate Dermatology Consultation',
            message: 'High malignancy risk detected. Schedule appointment within 48 hours.',
            action: 'Book urgent dermatology appointment',
            priority: 'critical'
          });
        } else if (analysisResult.malignancyRisk > 0.3) {
          recommendations.push({
            type: 'moderate',
            title: 'Dermatology Evaluation',
            message: 'Lesion requires professional evaluation within 2 weeks.',
            action: 'Schedule dermatology consultation',
            priority: 'high'
          });
        }
        break;

      case 'ophthalmology':
        if (analysisResult.visionThreat) {
          recommendations.push({
            type: 'urgent',
            title: 'Emergency Eye Care',
            message: 'Vision-threatening condition detected. Seek immediate care.',
            action: 'Contact emergency ophthalmology',
            priority: 'critical'
          });
        }
        break;

      case 'radiology':
        if (analysisResult.urgencyLevel === 'high') {
          recommendations.push({
            type: 'urgent',
            title: 'Immediate Medical Attention',
            message: 'Critical findings require immediate medical evaluation.',
            action: 'Contact emergency services or physician',
            priority: 'critical'
          });
        }
        break;
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'routine',
        title: 'Regular Monitoring',
        message: 'Continue routine health screenings and monitoring.',
        action: 'Schedule regular check-ups',
        priority: 'low'
      });
    }

    return recommendations;
  }

  calculateRiskAssessment(analysisResult) {
    let riskScore = 0;

    // Calculate risk based on findings
    if (analysisResult.malignancyRisk) {
      riskScore = analysisResult.malignancyRisk;
    } else if (analysisResult.visionThreat) {
      riskScore = 0.8;
    } else if (analysisResult.urgencyLevel === 'high') {
      riskScore = 0.9;
    } else if (analysisResult.pathologyDetected) {
      riskScore = 0.6;
    } else {
      riskScore = 0.2;
    }

    return {
      score: riskScore,
      level: this.getRiskLevel(riskScore),
      factors: this.identifyRiskFactors(analysisResult),
      timeline: this.getRecommendedTimeline(riskScore)
    };
  }

  getRiskLevel(score) {
    if (score > 0.8) return 'critical';
    if (score > 0.6) return 'high';
    if (score > 0.4) return 'moderate';
    if (score > 0.2) return 'low';
    return 'minimal';
  }

  identifyRiskFactors(analysisResult) {
    const factors = [];

    if (analysisResult.malignancyRisk > 0.5) factors.push('malignancy_risk');
    if (analysisResult.visionThreat) factors.push('vision_threat');
    if (analysisResult.pathologyDetected) factors.push('pathology_detected');
    if (analysisResult.abnormalitiesDetected?.length > 0) factors.push('abnormalities_present');

    return factors;
  }

  getRecommendedTimeline(riskScore) {
    if (riskScore > 0.8) return 'immediate';
    if (riskScore > 0.6) return '24-48_hours';
    if (riskScore > 0.4) return '1-2_weeks';
    if (riskScore > 0.2) return '1-3_months';
    return 'routine_screening';
  }

  extractImageFeatures(imagePath, analysisType) {
    // Mock feature extraction - in production, would use actual computer vision libraries
    return {
      colorHistogram: Array(256).fill().map(() => Math.random()),
      textureFeatures: {
        contrast: Math.random(),
        dissimilarity: Math.random(),
        homogeneity: Math.random(),
        energy: Math.random()
      },
      shapeFeatures: {
        area: Math.random() * 1000,
        perimeter: Math.random() * 200,
        roundness: Math.random(),
        compactness: Math.random()
      },
      edgeFeatures: {
        edgeDensity: Math.random(),
        edgeStrength: Math.random()
      }
    };
  }

  getImageStats(imagePath) {
    const stats = fs.statSync(imagePath);
    return {
      size: stats.size,
      dimensions: {
        width: Math.floor(Math.random() * 2000) + 512,
        height: Math.floor(Math.random() * 2000) + 512
      },
      format: path.extname(imagePath).substring(1).toUpperCase(),
      created: stats.birthtime,
      modified: stats.mtime
    };
  }

  async saveAnalysisResult(analysisData) {
    try {
      const query = `
        INSERT INTO cv_analyses (
          user_id, analysis_type, analysis_result, image_path, timestamp,
          confidence, risk_score, primary_finding
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

      await this.databaseService.execute(query, [
        analysisData.userId,
        analysisData.analysisType,
        JSON.stringify(analysisData.result),
        analysisData.imagePath,
        new Date(),
        analysisData.result.confidence,
        analysisData.result.riskAssessment.score,
        analysisData.result.analysisResult.primaryFinding || 'normal'
      ]);

      logger.info('CV analysis result saved to database', {
        userId: analysisData.userId,
        analysisType: analysisData.analysisType
      });

    } catch (error) {
      logger.error('Failed to save CV analysis result', { error: error.message });
    }
  }

  async getAnalysisHistory(userId, analysisType = null, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;

      let query = `
        SELECT * FROM cv_analyses
        WHERE user_id = $1
      `;
      const params = [userId];

      if (analysisType) {
        params.push(analysisType);
        query += ' AND analysis_type = $' + params.length;
      }

      query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const results = await this.databaseService.query(query, params);

      return results.map(result => ({
        id: result.id,
        analysisType: result.analysis_type,
        timestamp: result.timestamp,
        confidence: result.confidence,
        riskScore: result.risk_score,
        primaryFinding: result.primary_finding,
        analysisResult: JSON.parse(result.analysis_result)
      }));

    } catch (error) {
      logger.error('Failed to fetch CV analysis history', { error: error.message, userId });
      return [];
    }
  }

  async healthCheck() {
    try {
      // Check database connectivity
      await this.databaseService.query('SELECT 1');

      // Check models
      const modelsStatus = Object.keys(this.models).reduce((status, modelName) => {
        status[modelName] = this.models[modelName].loaded ? 'loaded' : 'not_loaded';
        return status;
      }, {});

      // Check temp directory
      const tempDirExists = fs.existsSync(this.tempDir);

      return {
        database: 'connected',
        models: modelsStatus,
        tempDirectory: tempDirExists ? 'available' : 'unavailable',
        imageProcessing: 'available',
        status: 'healthy'
      };

    } catch (error) {
      logger.error('Computer vision health check failed', { error: error.message });
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async cleanup() {
    try {
      // Clean up old temporary files
      if (fs.existsSync(this.tempDir)) {
        const tempFiles = fs.readdirSync(this.tempDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const file of tempFiles) {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            logger.info('Cleaned up old temp file', { file });
          }
        }
      }

      logger.info('Computer vision service cleanup completed');

    } catch (error) {
      logger.error('Computer vision service cleanup failed', { error: error.message });
    }
  }
}

module.exports = { ComputerVisionHealthService };
