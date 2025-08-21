const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../../services/logger');
const { authenticateToken } = require('../../middleware/auth');
const VoiceAnalysisService = require('../../services/VoiceAnalysisService');

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads/voice');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}-${Date.now()}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

const voiceAnalysisService = new VoiceAnalysisService();

/**
 * @route POST /api/health/analyze-voice
 * @desc Analyze voice for mental health indicators
 * @access Protected
 */
router.post('/analyze-voice', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { userId } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    logger.info('Starting voice analysis', {
      userId,
      filename: audioFile.filename,
      size: audioFile.size
    });

    // Analyze the voice sample
    const analysisResult = await voiceAnalysisService.analyzeAudio(
      audioFile.path,
      userId
    );

    // Generate recommendations based on analysis
    const recommendations = voiceAnalysisService.generateRecommendations(analysisResult);

    // Save analysis result to database
    await voiceAnalysisService.saveAnalysisResult({
      userId,
      analysisResult: {
        ...analysisResult,
        recommendations
      },
      audioFilePath: audioFile.path,
      timestamp: new Date()
    });

    // Clean up uploaded file after processing
    setTimeout(() => {
      try {
        fs.unlinkSync(audioFile.path);
      } catch (err) {
        logger.error('Failed to clean up audio file', { error: err.message });
      }
    }, 300000); // Delete after 5 minutes

    res.json({
      success: true,
      data: {
        ...analysisResult,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Voice analysis failed', {
      error: error.message,
      stack: error.stack
    });

    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up file after error', { error: cleanupError.message });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Voice analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/health/analyze-speech
 * @desc Analyze speech patterns for broader health insights
 * @access Protected
 */
router.post('/analyze-speech', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { analysisType, options } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const parsedOptions = options ? JSON.parse(options) : {};

    logger.info('Starting speech pattern analysis', {
      filename: audioFile.filename,
      analysisType,
      options: parsedOptions
    });

    const analysisResult = await voiceAnalysisService.analyzeSpeechPatterns(
      audioFile.path,
      analysisType,
      parsedOptions
    );

    // Clean up file
    setTimeout(() => {
      try {
        fs.unlinkSync(audioFile.path);
      } catch (err) {
        logger.error('Failed to clean up audio file', { error: err.message });
      }
    }, 300000);

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    logger.error('Speech analysis failed', {
      error: error.message,
      stack: error.stack
    });

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up file after error', { error: cleanupError.message });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Speech analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/health/transcribe-audio
 * @desc Transcribe audio to text
 * @access Protected
 */
router.post('/transcribe-audio', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    logger.info('Starting audio transcription', {
      filename: audioFile.filename,
      size: audioFile.size
    });

    const transcription = await voiceAnalysisService.transcribeAudio(audioFile.path);

    // Clean up file
    setTimeout(() => {
      try {
        fs.unlinkSync(audioFile.path);
      } catch (err) {
        logger.error('Failed to clean up audio file', { error: err.message });
      }
    }, 300000);

    res.json({
      success: true,
      data: {
        transcription,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Audio transcription failed', {
      error: error.message,
      stack: error.stack
    });

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up file after error', { error: cleanupError.message });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Transcription failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/health/voice-biomarkers
 * @desc Extract voice biomarkers for health assessment
 * @access Protected
 */
router.post('/voice-biomarkers', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { userId } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    logger.info('Extracting voice biomarkers', {
      userId,
      filename: audioFile.filename
    });

    const biomarkers = await voiceAnalysisService.extractVoiceBiomarkers(audioFile.path);

    // Clean up file
    setTimeout(() => {
      try {
        fs.unlinkSync(audioFile.path);
      } catch (err) {
        logger.error('Failed to clean up audio file', { error: err.message });
      }
    }, 300000);

    res.json({
      success: true,
      data: {
        biomarkers,
        userId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Voice biomarker extraction failed', {
      error: error.message,
      stack: error.stack
    });

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up file after error', { error: cleanupError.message });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Biomarker extraction failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/health/voice-history/:userId
 * @desc Get voice analysis history for a user
 * @access Protected
 */
router.get('/voice-history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    logger.info('Fetching voice analysis history', { userId, limit, offset });

    const history = await voiceAnalysisService.getAnalysisHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error('Failed to fetch voice history', {
      error: error.message,
      userId: req.params.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice analysis history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/health/voice-trends/:userId
 * @desc Get voice analysis trends over time
 * @access Protected
 */
router.get('/voice-trends/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    logger.info('Fetching voice analysis trends', { userId, period });

    const trends = await voiceAnalysisService.getVoiceTrends(userId, period);

    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    logger.error('Failed to fetch voice trends', {
      error: error.message,
      userId: req.params.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route DELETE /api/health/voice-analysis/:analysisId
 * @desc Delete a specific voice analysis record
 * @access Protected
 */
router.delete('/voice-analysis/:analysisId', authenticateToken, async (req, res) => {
  try {
    const { analysisId } = req.params;

    logger.info('Deleting voice analysis record', { analysisId });

    await voiceAnalysisService.deleteAnalysisRecord(analysisId);

    res.json({
      success: true,
      message: 'Voice analysis record deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete voice analysis record', {
      error: error.message,
      analysisId: req.params.analysisId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete voice analysis record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/health/voice-analysis/health-check
 * @desc Health check for voice analysis service
 * @access Public
 */
router.get('/voice-analysis/health-check', async (req, res) => {
  try {
    const healthStatus = await voiceAnalysisService.healthCheck();

    res.json({
      success: true,
      service: 'Voice Analysis API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: healthStatus
    });

  } catch (error) {
    logger.error('Voice analysis health check failed', {
      error: error.message
    });

    res.status(503).json({
      success: false,
      service: 'Voice Analysis API',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Error handling middleware specific to this router
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one audio file allowed.'
      });
    }
  }

  if (error.message === 'Only audio files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Please upload an audio file (mp3, wav, m4a, aac, ogg).'
    });
  }

  logger.error('Voice analysis router error', {
    error: error.message,
    stack: error.stack
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
