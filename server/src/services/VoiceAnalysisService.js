const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { logger } = require('./logger');
const { DatabaseService } = require('./databaseService');

class VoiceAnalysisService {
  constructor() {
    this.databaseService = new DatabaseService();
    this.tempDir = path.join(__dirname, '../../temp');
    this.initializeTempDir();
  }

  initializeTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async analyzeAudio(audioFilePath, userId) {
    try {
      logger.info('Starting comprehensive voice analysis', { audioFilePath, userId });

      // Extract audio features
      const audioFeatures = await this.extractAudioFeatures(audioFilePath);

      // Transcribe audio
      const transcription = await this.transcribeAudio(audioFilePath);

      // Extract voice biomarkers
      const biomarkers = await this.extractVoiceBiomarkers(audioFilePath);

      // Analyze mental health indicators
      const mentalHealthAnalysis = await this.analyzeMentalHealth(audioFeatures, transcription, biomarkers);

      // Calculate overall health score
      const overallScore = this.calculateOverallHealthScore(mentalHealthAnalysis, biomarkers);

      const result = {
        userId,
        overallScore,
        depressionRisk: mentalHealthAnalysis.depressionRisk,
        anxietyLevel: mentalHealthAnalysis.anxietyLevel,
        stressLevel: mentalHealthAnalysis.stressLevel,
        energyLevel: mentalHealthAnalysis.energyLevel,
        voiceStability: biomarkers.stability,
        speechClarity: biomarkers.clarity,
        audioFeatures,
        transcription,
        biomarkers,
        timestamp: new Date(),
        sampleRate: audioFeatures.sampleRate || 44100
      };

      logger.info('Voice analysis completed successfully', { userId, overallScore });
      return result;

    } catch (error) {
      logger.error('Voice analysis failed', { error: error.message, audioFilePath, userId });
      throw new Error(`Voice analysis failed: ${error.message}`);
    }
  }

  async transcribeAudio(audioFilePath) {
    try {
      // Simulate transcription using a mock AI service
      // In production, this would integrate with services like Google Speech-to-Text, AWS Transcribe, etc.

      logger.info('Starting audio transcription', { audioFilePath });

      // Mock transcription based on audio duration and characteristics
      const audioStats = await this.getAudioStats(audioFilePath);
      const duration = audioStats.duration || 30;

      // Generate realistic mock transcription
      const mockTranscriptions = [
        "Hello, I'm feeling pretty good today. The weather is nice and I had a great breakfast this morning.",
        "I've been dealing with some stress at work lately, but I'm trying to stay positive and manage it well.",
        "Today was challenging, but I'm grateful for the support from my family and friends.",
        "I feel energetic and motivated. I'm looking forward to completing my tasks today.",
        "Sometimes I feel a bit anxious, but I'm learning to cope with breathing exercises and meditation."
      ];

      const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

      logger.info('Audio transcription completed', { transcription: transcription.substring(0, 50) + '...' });
      return transcription;

    } catch (error) {
      logger.error('Audio transcription failed', { error: error.message });
      // Return empty transcription rather than failing the entire analysis
      return '';
    }
  }

  async extractVoiceBiomarkers(audioFilePath) {
    try {
      logger.info('Extracting voice biomarkers', { audioFilePath });

      // Extract audio statistics
      const audioStats = await this.getAudioStats(audioFilePath);

      // Calculate voice biomarkers based on audio characteristics
      const biomarkers = {
        fundamentalFrequency: this.calculateFundamentalFrequency(audioStats),
        jitter: this.calculateJitter(audioStats),
        shimmer: this.calculateShimmer(audioStats),
        harmonicToNoiseRatio: this.calculateHNR(audioStats),
        spectralCentroid: this.calculateSpectralCentroid(audioStats),
        spectralRolloff: this.calculateSpectralRolloff(audioStats),
        mfcc: this.calculateMFCC(audioStats),
        voicingRate: this.calculateVoicingRate(audioStats),
        speakingRate: this.calculateSpeakingRate(audioStats),
        pausePatterns: this.analyzePausePatterns(audioStats),
        stability: this.calculateVoiceStability(audioStats),
        clarity: this.calculateSpeechClarity(audioStats),
        intensity: this.calculateIntensity(audioStats),
        prosody: this.analyzeProsody(audioStats)
      };

      logger.info('Voice biomarkers extracted successfully', {
        fundamentalFreq: biomarkers.fundamentalFrequency,
        stability: biomarkers.stability
      });

      return biomarkers;

    } catch (error) {
      logger.error('Voice biomarker extraction failed', { error: error.message });
      throw new Error(`Biomarker extraction failed: ${error.message}`);
    }
  }

  async analyzeMentalHealth(audioFeatures, transcription, biomarkers) {
    try {
      logger.info('Analyzing mental health indicators');

      // Analyze depression risk based on voice characteristics
      const depressionRisk = this.calculateDepressionRisk(biomarkers, audioFeatures);

      // Analyze anxiety level
      const anxietyLevel = this.calculateAnxietyLevel(biomarkers, audioFeatures);

      // Analyze stress level
      const stressLevel = this.calculateStressLevel(biomarkers, audioFeatures);

      // Analyze energy level
      const energyLevel = this.calculateEnergyLevel(biomarkers, audioFeatures);

      // Analyze mood indicators
      const moodIndicators = this.analyzeMoodFromTranscription(transcription);

      const analysis = {
        depressionRisk: Math.max(0, Math.min(1, depressionRisk + moodIndicators.depressionFactor)),
        anxietyLevel: Math.max(0, Math.min(1, anxietyLevel + moodIndicators.anxietyFactor)),
        stressLevel: Math.max(0, Math.min(10, stressLevel + moodIndicators.stressFactor)),
        energyLevel: Math.max(0, Math.min(1, energyLevel + moodIndicators.energyFactor)),
        cognitiveLoad: this.calculateCognitiveLoad(biomarkers),
        emotionalStability: this.calculateEmotionalStability(biomarkers),
        confidence: this.calculateConfidenceLevel(biomarkers, audioFeatures)
      };

      logger.info('Mental health analysis completed', analysis);
      return analysis;

    } catch (error) {
      logger.error('Mental health analysis failed', { error: error.message });
      throw new Error(`Mental health analysis failed: ${error.message}`);
    }
  }

  calculateDepressionRisk(biomarkers, audioFeatures) {
    // Depression indicators in voice:
    // - Lower fundamental frequency
    // - Reduced vocal intensity
    // - Slower speaking rate
    // - Increased pauses
    // - Reduced prosodic variation

    let risk = 0;

    // Low fundamental frequency (monotone speech)
    if (biomarkers.fundamentalFrequency < 120) risk += 0.2;

    // Low intensity (quiet speech)
    if (biomarkers.intensity < 0.3) risk += 0.15;

    // Slow speaking rate
    if (biomarkers.speakingRate < 3.0) risk += 0.2;

    // High jitter (voice instability)
    if (biomarkers.jitter > 0.02) risk += 0.15;

    // Low prosodic variation
    if (biomarkers.prosody.variation < 0.3) risk += 0.2;

    // Long pauses
    if (biomarkers.pausePatterns.averagePauseLength > 2.0) risk += 0.1;

    return Math.min(risk, 1.0);
  }

  calculateAnxietyLevel(biomarkers, audioFeatures) {
    // Anxiety indicators in voice:
    // - Higher fundamental frequency
    // - Increased jitter and shimmer
    // - Faster speaking rate
    // - More frequent pauses
    // - Voice tremor

    let anxietyScore = 0;

    // High fundamental frequency (tense voice)
    if (biomarkers.fundamentalFrequency > 200) anxietyScore += 0.2;

    // High jitter (voice tremor)
    if (biomarkers.jitter > 0.03) anxietyScore += 0.25;

    // High shimmer (amplitude variation)
    if (biomarkers.shimmer > 0.1) anxietyScore += 0.2;

    // Fast speaking rate (rushed speech)
    if (biomarkers.speakingRate > 6.0) anxietyScore += 0.15;

    // Frequent short pauses
    if (biomarkers.pausePatterns.pauseFrequency > 0.3) anxietyScore += 0.2;

    return Math.min(anxietyScore, 1.0);
  }

  calculateStressLevel(biomarkers, audioFeatures) {
    // Stress indicators in voice:
    // - Increased vocal tension
    // - Higher pitch variability
    // - Irregular breathing patterns
    // - Reduced voice quality

    let stressScore = 0;

    // High fundamental frequency variability
    if (biomarkers.prosody.pitchVariability > 0.7) stressScore += 2;

    // Poor harmonics-to-noise ratio
    if (biomarkers.harmonicToNoiseRatio < 0.7) stressScore += 2;

    // High jitter and shimmer combination
    if (biomarkers.jitter > 0.025 && biomarkers.shimmer > 0.08) stressScore += 2;

    // Irregular pause patterns
    if (biomarkers.pausePatterns.irregularity > 0.6) stressScore += 2;

    // Low voice stability
    if (biomarkers.stability < 0.4) stressScore += 2;

    return Math.min(stressScore, 10);
  }

  calculateEnergyLevel(biomarkers, audioFeatures) {
    // Energy indicators in voice:
    // - Vocal intensity
    // - Speaking rate
    // - Prosodic richness
    // - Voice clarity

    let energyScore = 0.5; // baseline

    // High intensity indicates energy
    if (biomarkers.intensity > 0.7) energyScore += 0.2;
    else if (biomarkers.intensity < 0.3) energyScore -= 0.2;

    // Optimal speaking rate indicates energy
    if (biomarkers.speakingRate >= 4.0 && biomarkers.speakingRate <= 5.5) energyScore += 0.15;
    else if (biomarkers.speakingRate < 3.0) energyScore -= 0.2;

    // Rich prosody indicates energy
    if (biomarkers.prosody.variation > 0.6) energyScore += 0.15;

    // Clear speech indicates energy
    if (biomarkers.clarity > 0.7) energyScore += 0.1;

    return Math.max(0, Math.min(1, energyScore));
  }

  analyzeMoodFromTranscription(transcription) {
    const positiveWords = ['good', 'great', 'happy', 'wonderful', 'excellent', 'amazing', 'fantastic', 'love', 'joy', 'excited'];
    const negativeWords = ['bad', 'terrible', 'sad', 'awful', 'horrible', 'hate', 'depressed', 'anxious', 'worried', 'stressed'];
    const anxietyWords = ['nervous', 'worried', 'anxious', 'scared', 'afraid', 'panic', 'overwhelmed'];
    const energyWords = ['energetic', 'motivated', 'active', 'dynamic', 'vigorous', 'enthusiastic'];

    const words = transcription.toLowerCase().split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;
    let anxietyCount = 0;
    let energyCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
      if (anxietyWords.includes(word)) anxietyCount++;
      if (energyWords.includes(word)) energyCount++;
    });

    const totalWords = words.length || 1;

    return {
      depressionFactor: (negativeCount - positiveCount) / totalWords,
      anxietyFactor: anxietyCount / totalWords,
      stressFactor: anxietyCount / totalWords * 2,
      energyFactor: (energyCount + positiveCount - negativeCount) / totalWords
    };
  }

  generateRecommendations(analysisResult) {
    const recommendations = [];

    if (analysisResult.depressionRisk > 0.7) {
      recommendations.push({
        type: 'urgent',
        title: 'Mental Health Support',
        message: 'Your voice analysis indicates elevated depression risk. Consider speaking with a mental health professional.',
        action: 'Schedule consultation',
        priority: 'high'
      });
    }

    if (analysisResult.anxietyLevel > 0.6) {
      recommendations.push({
        type: 'moderate',
        title: 'Anxiety Management',
        message: 'Try daily meditation, breathing exercises, or mindfulness practices.',
        action: 'Start mindfulness practice',
        priority: 'medium'
      });
    }

    if (analysisResult.stressLevel > 7) {
      recommendations.push({
        type: 'moderate',
        title: 'Stress Reduction',
        message: 'Focus on stress management techniques and ensure adequate sleep (7-9 hours).',
        action: 'Improve sleep hygiene',
        priority: 'medium'
      });
    }

    if (analysisResult.energyLevel < 0.3) {
      recommendations.push({
        type: 'low',
        title: 'Energy Enhancement',
        message: 'Consider regular physical exercise, proper nutrition, and consistent sleep schedule.',
        action: 'Plan exercise routine',
        priority: 'low'
      });
    }

    if (analysisResult.voiceStability < 0.4) {
      recommendations.push({
        type: 'moderate',
        title: 'Voice Health',
        message: 'Stay well hydrated and consider vocal exercises or speech therapy.',
        action: 'Vocal care routine',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  async saveAnalysisResult(data) {
    try {
      const query = `
        INSERT INTO voice_analyses (
          user_id, analysis_result, audio_file_path, timestamp,
          overall_score, depression_risk, anxiety_level, stress_level, energy_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

      await this.databaseService.execute(query, [
        data.userId,
        JSON.stringify(data.analysisResult),
        data.audioFilePath,
        data.timestamp,
        data.analysisResult.overallScore,
        data.analysisResult.depressionRisk,
        data.analysisResult.anxietyLevel,
        data.analysisResult.stressLevel,
        data.analysisResult.energyLevel
      ]);

      logger.info('Voice analysis result saved to database', { userId: data.userId });

    } catch (error) {
      logger.error('Failed to save analysis result', { error: error.message });
      // Don't throw error to avoid breaking the main analysis flow
    }
  }

  async getAnalysisHistory(userId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;

      const query = `
        SELECT * FROM voice_analyses
        WHERE user_id = $1
        ORDER BY timestamp DESC
        LIMIT $2 OFFSET $3
      `;

      const results = await this.databaseService.query(query, [userId, limit, offset]);

      return results.map(result => ({
        id: result.id,
        timestamp: result.timestamp,
        overallScore: result.overall_score,
        depressionRisk: result.depression_risk,
        anxietyLevel: result.anxiety_level,
        stressLevel: result.stress_level,
        energyLevel: result.energy_level,
        analysisResult: JSON.parse(result.analysis_result)
      }));

    } catch (error) {
      logger.error('Failed to fetch analysis history', { error: error.message, userId });
      return [];
    }
  }

  // Helper methods for audio feature extraction
  async getAudioStats(audioFilePath) {
    // Mock audio statistics - in production, this would use audio processing libraries
    return {
      duration: Math.random() * 60 + 15, // 15-75 seconds
      sampleRate: 44100,
      channels: 1,
      bitRate: 128,
      fileSize: fs.statSync(audioFilePath).size
    };
  }

  async extractAudioFeatures(audioFilePath) {
    const stats = await this.getAudioStats(audioFilePath);

    return {
      sampleRate: stats.sampleRate,
      duration: stats.duration,
      channels: stats.channels,
      bitRate: stats.bitRate,
      fileSize: stats.fileSize,
      // Mock additional features
      rms: Math.random() * 0.5 + 0.3,
      zcr: Math.random() * 0.1 + 0.05,
      spectralFeatures: {
        centroid: Math.random() * 2000 + 1000,
        rolloff: Math.random() * 4000 + 2000,
        bandwidth: Math.random() * 1000 + 500
      }
    };
  }

  calculateFundamentalFrequency(audioStats) {
    // Mock F0 calculation based on typical human voice ranges
    return Math.random() * 200 + 100; // 100-300 Hz
  }

  calculateJitter(audioStats) {
    return Math.random() * 0.05; // 0-5%
  }

  calculateShimmer(audioStats) {
    return Math.random() * 0.15; // 0-15%
  }

  calculateHNR(audioStats) {
    return Math.random() * 0.4 + 0.6; // 0.6-1.0
  }

  calculateSpectralCentroid(audioStats) {
    return Math.random() * 2000 + 1000; // 1000-3000 Hz
  }

  calculateSpectralRolloff(audioStats) {
    return Math.random() * 4000 + 2000; // 2000-6000 Hz
  }

  calculateMFCC(audioStats) {
    return Array(13).fill().map(() => Math.random() * 2 - 1); // 13 MFCC coefficients
  }

  calculateVoicingRate(audioStats) {
    return Math.random() * 0.3 + 0.5; // 50-80%
  }

  calculateSpeakingRate(audioStats) {
    return Math.random() * 4 + 2; // 2-6 syllables per second
  }

  analyzePausePatterns(audioStats) {
    return {
      averagePauseLength: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
      pauseFrequency: Math.random() * 0.4 + 0.1, // 10-50%
      irregularity: Math.random() * 0.8 + 0.1 // 10-90%
    };
  }

  calculateVoiceStability(audioStats) {
    return Math.random() * 0.4 + 0.4; // 40-80%
  }

  calculateSpeechClarity(audioStats) {
    return Math.random() * 0.3 + 0.5; // 50-80%
  }

  calculateIntensity(audioStats) {
    return Math.random() * 0.6 + 0.2; // 20-80%
  }

  analyzeProsody(audioStats) {
    return {
      variation: Math.random() * 0.6 + 0.2, // 20-80%
      pitchVariability: Math.random() * 0.8 + 0.1, // 10-90%
      rhythmicity: Math.random() * 0.7 + 0.2 // 20-90%
    };
  }

  calculateOverallHealthScore(mentalHealthAnalysis, biomarkers) {
    // Weighted combination of all health indicators
    const weights = {
      depression: 0.25,
      anxiety: 0.25,
      stress: 0.20,
      energy: 0.15,
      stability: 0.10,
      clarity: 0.05
    };

    const score = (
      (1 - mentalHealthAnalysis.depressionRisk) * weights.depression +
      (1 - mentalHealthAnalysis.anxietyLevel) * weights.anxiety +
      (1 - mentalHealthAnalysis.stressLevel / 10) * weights.stress +
      mentalHealthAnalysis.energyLevel * weights.energy +
      biomarkers.stability * weights.stability +
      biomarkers.clarity * weights.clarity
    );

    return Math.max(0, Math.min(1, score));
  }

  calculateCognitiveLoad(biomarkers) {
    // Estimate cognitive load based on speech patterns
    let load = 0.5; // baseline

    if (biomarkers.pausePatterns.averagePauseLength > 2.0) load += 0.2;
    if (biomarkers.speakingRate < 3.0) load += 0.2;
    if (biomarkers.prosody.variation < 0.3) load += 0.1;

    return Math.max(0, Math.min(1, load));
  }

  calculateEmotionalStability(biomarkers) {
    // Assess emotional stability from voice characteristics
    let stability = 0.8; // baseline high

    if (biomarkers.jitter > 0.03) stability -= 0.2;
    if (biomarkers.shimmer > 0.1) stability -= 0.2;
    if (biomarkers.prosody.pitchVariability > 0.8) stability -= 0.3;

    return Math.max(0, Math.min(1, stability));
  }

  calculateConfidenceLevel(biomarkers, audioFeatures) {
    // Estimate confidence from voice characteristics
    let confidence = 0.6; // baseline

    if (biomarkers.intensity > 0.6) confidence += 0.2;
    if (biomarkers.clarity > 0.7) confidence += 0.1;
    if (biomarkers.stability > 0.6) confidence += 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  async analyzeSpeechPatterns(audioFilePath, analysisType, options) {
    try {
      logger.info('Analyzing speech patterns', { audioFilePath, analysisType });

      const audioFeatures = await this.extractAudioFeatures(audioFilePath);
      const biomarkers = await this.extractVoiceBiomarkers(audioFilePath);

      let analysis = {};

      switch (analysisType) {
        case 'fluency':
          analysis = this.analyzeFluency(biomarkers, audioFeatures);
          break;
        case 'emotion':
          analysis = this.analyzeEmotionalState(biomarkers, audioFeatures);
          break;
        case 'cognitive':
          analysis = this.analyzeCognitiveState(biomarkers, audioFeatures);
          break;
        default:
          analysis = this.comprehensiveSpeechAnalysis(biomarkers, audioFeatures);
      }

      return {
        analysisType,
        timestamp: new Date().toISOString(),
        analysis,
        audioFeatures,
        biomarkers
      };

    } catch (error) {
      logger.error('Speech pattern analysis failed', { error: error.message });
      throw error;
    }
  }

  analyzeFluency(biomarkers, audioFeatures) {
    return {
      fluencyScore: biomarkers.clarity * 0.4 + biomarkers.stability * 0.6,
      hesitationRate: biomarkers.pausePatterns.pauseFrequency,
      articulationClarity: biomarkers.clarity,
      speechRhythm: biomarkers.prosody.rhythmicity,
      recommendations: biomarkers.clarity < 0.6 ? ['Consider speech therapy exercises'] : ['Maintain good speech habits']
    };
  }

  analyzeEmotionalState(biomarkers, audioFeatures) {
    return {
      valence: this.calculateValence(biomarkers),
      arousal: this.calculateArousal(biomarkers),
      dominance: this.calculateDominance(biomarkers),
      emotionalStability: this.calculateEmotionalStability(biomarkers),
      primaryEmotion: this.identifyPrimaryEmotion(biomarkers)
    };
  }

  analyzeCognitiveState(biomarkers, audioFeatures) {
    return {
      cognitiveLoad: this.calculateCognitiveLoad(biomarkers),
      processingSpeed: 1 / biomarkers.pausePatterns.averagePauseLength,
      mentalClarity: biomarkers.clarity,
      attentionLevel: this.calculateAttentionLevel(biomarkers),
      workingMemoryIndex: this.calculateWorkingMemoryIndex(biomarkers)
    };
  }

  comprehensiveSpeechAnalysis(biomarkers, audioFeatures) {
    return {
      fluency: this.analyzeFluency(biomarkers, audioFeatures),
      emotion: this.analyzeEmotionalState(biomarkers, audioFeatures),
      cognitive: this.analyzeCognitiveState(biomarkers, audioFeatures),
      overallAssessment: {
        healthScore: this.calculateOverallHealthScore({
          depressionRisk: 0.3,
          anxietyLevel: 0.3,
          stressLevel: 5,
          energyLevel: 0.7
        }, biomarkers),
        communicationEffectiveness: (biomarkers.clarity + biomarkers.stability) / 2,
        recommendations: this.generateComprehensiveRecommendations(biomarkers)
      }
    };
  }

  calculateValence(biomarkers) {
    // Positive valence: higher pitch variation, stable voice
    return (biomarkers.prosody.variation + biomarkers.stability) / 2;
  }

  calculateArousal(biomarkers) {
    // High arousal: faster speech, higher intensity
    return Math.min(1, (biomarkers.speakingRate / 6 + biomarkers.intensity) / 2);
  }

  calculateDominance(biomarkers) {
    // High dominance: stable, clear, intense speech
    return (biomarkers.stability + biomarkers.clarity + biomarkers.intensity) / 3;
  }

  identifyPrimaryEmotion(biomarkers) {
    const valence = this.calculateValence(biomarkers);
    const arousal = this.calculateArousal(biomarkers);

    if (valence > 0.6 && arousal > 0.6) return 'excited';
    if (valence > 0.6 && arousal < 0.4) return 'calm';
    if (valence < 0.4 && arousal > 0.6) return 'anxious';
    if (valence < 0.4 && arousal < 0.4) return 'sad';
    return 'neutral';
  }

  calculateAttentionLevel(biomarkers) {
    // High attention: consistent speech patterns, appropriate pauses
    const pauseConsistency = 1 - biomarkers.pausePatterns.irregularity;
    return (biomarkers.stability + pauseConsistency) / 2;
  }

  calculateWorkingMemoryIndex(biomarkers) {
    // Working memory reflected in speech fluency and complexity
    return (biomarkers.clarity + (1 - biomarkers.pausePatterns.pauseFrequency)) / 2;
  }

  generateComprehensiveRecommendations(biomarkers) {
    const recommendations = [];

    if (biomarkers.clarity < 0.5) {
      recommendations.push('Practice articulation exercises');
    }
    if (biomarkers.stability < 0.5) {
      recommendations.push('Consider vocal coaching or speech therapy');
    }
    if (biomarkers.intensity < 0.4) {
      recommendations.push('Work on projecting your voice with confidence');
    }
    if (biomarkers.prosody.variation < 0.3) {
      recommendations.push('Practice varying your tone and pitch for more engaging speech');
    }

    return recommendations.length > 0 ? recommendations : ['Your speech patterns are healthy - keep it up!'];
  }

  async getVoiceTrends(userId, period) {
    try {
      const periodDays = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const query = `
        SELECT
          DATE(timestamp) as date,
          AVG(overall_score) as avg_score,
          AVG(depression_risk) as avg_depression_risk,
          AVG(anxiety_level) as avg_anxiety_level,
          AVG(stress_level) as avg_stress_level,
          AVG(energy_level) as avg_energy_level,
          COUNT(*) as analysis_count
        FROM voice_analyses
        WHERE user_id = $1 AND timestamp >= $2
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `;

      const trends = await this.databaseService.query(query, [userId, startDate]);

      return {
        period,
        trends: trends.map(trend => ({
          date: trend.date,
          overallScore: trend.avg_score,
          depressionRisk: trend.avg_depression_risk,
          anxietyLevel: trend.avg_anxiety_level,
          stressLevel: trend.avg_stress_level,
          energyLevel: trend.avg_energy_level,
          analysisCount: trend.analysis_count
        })),
        summary: this.calculateTrendsSummary(trends)
      };

    } catch (error) {
      logger.error('Failed to fetch voice trends', { error: error.message, userId });
      return { period, trends: [], summary: {} };
    }
  }

  parsePeriod(period) {
    const match = period.match(/(\d+)([dwmy])/);
    if (!match) return 30; // default to 30 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      case 'y': return value * 365;
      default: return 30;
    }
  }

  calculateTrendsSummary(trends) {
    if (trends.length === 0) return {};

    const latest = trends[0];
    const earliest = trends[trends.length - 1];

    return {
      totalAnalyses: trends.reduce((sum, t) => sum + t.analysis_count, 0),
      averageScore: trends.reduce((sum, t) => sum + t.avg_score, 0) / trends.length,
      scoreImprovement: latest.avg_score - earliest.avg_score,
      trendDirection: this.calculateTrendDirection(trends),
      healthMetrics: {
        depression: {
          current: latest.avg_depression_risk,
          change: latest.avg_depression_risk - earliest.avg_depression_risk
        },
        anxiety: {
          current: latest.avg_anxiety_level,
          change: latest.avg_anxiety_level - earliest.avg_anxiety_level
        },
        stress: {
          current: latest.avg_stress_level,
          change: latest.avg_stress_level - earliest.avg_stress_level
        },
        energy: {
          current: latest.avg_energy_level,
          change: latest.avg_energy_level - earliest.avg_energy_level
        }
      }
    };
  }

  calculateTrendDirection(trends) {
    if (trends.length < 2) return 'stable';

    const scores = trends.map(t => t.avg_score);
    const recentAvg = scores.slice(0, Math.ceil(scores.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 3);
    const earlierAvg = scores.slice(-Math.ceil(scores.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 3);

    const difference = recentAvg - earlierAvg;

    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  async deleteAnalysisRecord(analysisId) {
    try {
  const query = 'DELETE FROM voice_analyses WHERE id = $1';
  await this.databaseService.execute(query, [analysisId]);

      logger.info('Voice analysis record deleted', { analysisId });

    } catch (error) {
      logger.error('Failed to delete voice analysis record', { error: error.message, analysisId });
      throw new Error(`Failed to delete analysis record: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      // Check database connectivity
      await this.databaseService.query('SELECT 1');

      // Check temp directory
      const tempDirExists = fs.existsSync(this.tempDir);

      // Check disk space (mock)
      const diskSpace = this.checkDiskSpace();

      return {
        database: 'connected',
        tempDirectory: tempDirExists ? 'available' : 'unavailable',
        diskSpace: diskSpace,
        audioProcessing: 'available',
        aiModels: 'loaded',
        status: 'healthy'
      };

    } catch (error) {
      logger.error('Voice analysis service health check failed', { error: error.message });
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  checkDiskSpace() {
    // Mock disk space check - in production would use actual system calls
    return {
      available: '10GB',
      used: '2GB',
      total: '12GB',
      percentage: 17
    };
  }

  async cleanup() {
    try {
      // Clean up old temporary files
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

      logger.info('Voice analysis service cleanup completed');

    } catch (error) {
      logger.error('Voice analysis service cleanup failed', { error: error.message });
    }
  }
}

module.exports = { VoiceAnalysisService };
