import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VoiceAnalysisService } from '../services/VoiceAnalysisService';

const { width, height } = Dimensions.get('window');

const VoiceAnalysisScreen = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [animationValue] = useState(new Animated.Value(1));
  const [waveAnimation] = useState(new Animated.Value(0));

  const voiceService = new VoiceAnalysisService();
  const userId = route.params?.userId || 'demo-user';

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Animate recording button
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate sound waves
      Animated.loop(
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      animationValue.setValue(1);
      waveAnimation.setValue(0);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    const hasPermission = await voiceService.getRecordingPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to analyze your voice.');
      return;
    }

    const success = await voiceService.startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingDuration(0);
      setAnalysisResult(null);
    } else {
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      const audioUri = await voiceService.stopRecording();
      if (audioUri) {
        const result = await voiceService.analyzeVoiceForMentalHealth(audioUri, userId);
        setAnalysisResult(result);
      } else {
        throw new Error('No audio recorded');
      }
    } catch (error) {
      Alert.alert('Analysis Error', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    return voiceService.getHealthScoreColor(score);
  };

  const getRiskLevel = (score) => {
    return voiceService.getRiskLevel(score);
  };

  const renderRecordingButton = () => (
    <View style={styles.recordingContainer}>
      {isRecording && (
        <>
          {[...Array(3)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.soundWave,
                {
                  opacity: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                  transform: [
                    {
                      scale: waveAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5 + index * 0.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </>
      )}

      <Animated.View
        style={[
          styles.recordButton,
          {
            transform: [{ scale: animationValue }],
            backgroundColor: isRecording ? '#FF4444' : '#4CAF50',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.recordButtonInner}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderAnalysisResults = () => (
    <ScrollView style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Voice Analysis Results</Text>

      {/* Overall Health Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.cardTitle}>Overall Health Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: getScoreColor(analysisResult.overallScore) }]}>
            {Math.round(analysisResult.overallScore * 100)}%
          </Text>
          <Text style={styles.scoreLabel}>
            {getRiskLevel(1 - analysisResult.overallScore)}
          </Text>
        </View>
      </View>

      {/* Mental Health Indicators */}
      <View style={styles.indicatorsContainer}>
        <Text style={styles.sectionTitle}>Mental Health Indicators</Text>

        <View style={styles.indicatorRow}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Depression Risk</Text>
            <Text style={[styles.indicatorValue, { color: getScoreColor(1 - analysisResult.depressionRisk) }]}>
              {getRiskLevel(analysisResult.depressionRisk)}
            </Text>
          </View>

          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Anxiety Level</Text>
            <Text style={[styles.indicatorValue, { color: getScoreColor(1 - analysisResult.anxietyLevel) }]}>
              {getRiskLevel(analysisResult.anxietyLevel)}
            </Text>
          </View>
        </View>

        <View style={styles.indicatorRow}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Stress Level</Text>
            <Text style={[styles.indicatorValue, { color: getScoreColor(1 - analysisResult.stressLevel / 10) }]}>
              {Math.round(analysisResult.stressLevel)}/10
            </Text>
          </View>

          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Energy Level</Text>
            <Text style={[styles.indicatorValue, { color: getScoreColor(analysisResult.energyLevel) }]}>
              {Math.round(analysisResult.energyLevel * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Voice Characteristics */}
      <View style={styles.characteristicsContainer}>
        <Text style={styles.sectionTitle}>Voice Characteristics</Text>

        <View style={styles.characteristicItem}>
          <Text style={styles.characteristicLabel}>Voice Stability</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${analysisResult.voiceStability * 100}%`,
                  backgroundColor: getScoreColor(analysisResult.voiceStability),
                },
              ]}
            />
          </View>
          <Text style={styles.characteristicValue}>
            {Math.round(analysisResult.voiceStability * 100)}%
          </Text>
        </View>

        <View style={styles.characteristicItem}>
          <Text style={styles.characteristicLabel}>Speech Clarity</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${analysisResult.speechClarity * 100}%`,
                  backgroundColor: getScoreColor(analysisResult.speechClarity),
                },
              ]}
            />
          </View>
          <Text style={styles.characteristicValue}>
            {Math.round(analysisResult.speechClarity * 100)}%
          </Text>
        </View>
      </div>

      {/* Recommendations */}
      {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Health Recommendations</Text>
          {analysisResult.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={[styles.recommendationIcon, { backgroundColor: getRecommendationColor(rec.type) }]}>
                <Ionicons name={getRecommendationIcon(rec.type)} size={20} color="white" />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationMessage}>{rec.message}</Text>
                {rec.action && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>{rec.action}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Analysis Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Analysis Details</Text>
        <Text style={styles.detailText}>
          Recording Duration: {voiceService.formatDuration(recordingDuration)}
        </Text>
        <Text style={styles.detailText}>
          Analysis Date: {new Date(analysisResult.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.detailText}>
          Sample Rate: {analysisResult.sampleRate || 44100} Hz
        </Text>
      </View>
    </ScrollView>
  );

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'urgent': return '#FF4444';
      case 'moderate': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'urgent': return 'warning';
      case 'moderate': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'bulb';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Analysis</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('VoiceHistory', { userId })}
          >
            <Ionicons name="time" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Analyzing your voice...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        ) : analysisResult ? (
          renderAnalysisResults()
        ) : (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Voice Health Analysis</Text>
            <Text style={styles.instructionsText}>
              Tap the microphone to record a 15-30 second voice sample.
              Our AI will analyze your voice patterns to assess mental health indicators.
            </Text>

            {isRecording && (
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingText}>Recording...</Text>
                <Text style={styles.durationText}>
                  {voiceService.formatDuration(recordingDuration)}
                </Text>
              </View>
            )}

            {renderRecordingButton()}

            <Text style={styles.privacyText}>
              🔒 Your voice data is processed securely and not stored permanently
            </Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  historyButton: {
    padding: 8,
  },
  instructionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  soundWave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingText: {
    fontSize: 18,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  privacyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  indicatorsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  indicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  characteristicsContainer: {
    marginBottom: 20,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  characteristicLabel: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  characteristicValue: {
    fontSize: 12,
    color: 'white',
    width: 40,
    textAlign: 'right',
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  recommendationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
});

export default VoiceAnalysisScreen;
