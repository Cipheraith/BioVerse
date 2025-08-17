import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Components
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import HealthPredictionCard from '../../components/health/HealthPredictionCard';
import RiskFactorCard from '../../components/health/RiskFactorCard';

// Services
import { AIService } from '../../services/AIService';
import { HealthService } from '../../services/HealthService';

// Constants
import { colors, gradients, spacing, typography } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const HealthTwinScreen = ({ navigation }) => {
  const [healthTwinData, setHealthTwinData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [riskFactors, setRiskFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    initializeHealthTwin();
    startAnimations();
  }, []);

  const initializeHealthTwin = async () => {
    try {
      setLoading(true);
      
      // Load health twin data
      const twinData = await HealthService.getHealthTwinData();
      setHealthTwinData(twinData);

      // Load AI predictions
      const aiPredictions = await AIService.getHealthPredictions();
      setPredictions(aiPredictions);

      // Load risk factors
      const risks = await AIService.getRiskFactors();
      setRiskFactors(risks);

    } catch (error) {
      console.error('Error loading health twin:', error);
      Alert.alert('Error', 'Failed to load health twin data');
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateNewPrediction = async () => {
    try {
      setLoading(true);
      const newPrediction = await AIService.generateHealthPrediction();
      setPredictions([newPrediction, ...predictions]);
      
      // Award tokens for health analysis
      await HealthService.awardTokens(50, 'health_prediction_completed');
      
      Alert.alert(
        'Prediction Generated!',
        'Your new health prediction is ready. You earned 50 BVH tokens!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  // Sample chart data
  const healthScoreData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [85, 87, 84, 89, 92, 95],
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const riskDistributionData = [
    {
      name: 'Low Risk',
      population: 65,
      color: colors.success[500],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Medium Risk',
      population: 25,
      color: colors.warning[500],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'High Risk',
      population: 10,
      color: colors.error[500],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const timeframes = ['1W', '1M', '3M', '6M', '1Y'];

  if (loading && !healthTwinData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={gradients.hero} style={styles.background}>
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingSpinner,
                {
                  transform: [{
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }
              ]}
            >
              <Ionicons name="medical" size={48} color={colors.primary[400]} />
            </Animated.View>
            <Text style={styles.loadingText}>Analyzing Your Health Twin...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital Health Twin</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Health Score Overview */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <GlassCard style={styles.healthScoreCard}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.healthScoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.healthScoreContent}>
                  <View style={styles.healthScoreHeader}>
                    <Ionicons name="heart" size={32} color={colors.text} />
                    <Text style={styles.healthScoreTitle}>Health Score</Text>
                  </View>
                  <Text style={styles.healthScoreValue}>95</Text>
                  <Text style={styles.healthScoreSubtitle}>Excellent Health</Text>
                  <View style={styles.healthScoreProgress}>
                    <View style={[styles.progressBar, { width: '95%' }]} />
                  </View>
                </View>
              </LinearGradient>
            </GlassCard>
          </Animated.View>

          {/* Timeframe Selector */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <View style={styles.timeframeSelector}>
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe)}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      selectedTimeframe === timeframe && styles.timeframeTextActive,
                    ]}
                  >
                    {timeframe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Health Trend Chart */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Health Trend</Text>
            <GlassCard style={styles.chartCard}>
              <LineChart
                data={healthScoreData}
                width={width - spacing.lg * 4}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={false}
                withInnerLines={false}
                withOuterLines={false}
              />
            </GlassCard>
          </Animated.View>

          {/* AI Predictions */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI Health Predictions</Text>
              <GradientButton
                title="Generate New"
                gradient={gradients.ai}
                style={styles.generateButton}
                onPress={generateNewPrediction}
                loading={loading}
              />
            </View>
            
            {predictions.length > 0 ? (
              predictions.slice(0, 3).map((prediction, index) => (
                <HealthPredictionCard
                  key={index}
                  prediction={prediction}
                  style={styles.predictionCard}
                />
              ))
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="brain" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Predictions Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Generate your first AI health prediction
                </Text>
              </GlassCard>
            )}
          </Animated.View>

          {/* Risk Distribution */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Risk Distribution</Text>
            <GlassCard style={styles.chartCard}>
              <PieChart
                data={riskDistributionData}
                width={width - spacing.lg * 4}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </GlassCard>
          </Animated.View>

          {/* Risk Factors */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Risk Factors</Text>
            {riskFactors.length > 0 ? (
              riskFactors.map((risk, index) => (
                <RiskFactorCard
                  key={index}
                  riskFactor={risk}
                  style={styles.riskCard}
                />
              ))
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="shield-checkmark" size={48} color={colors.success[400]} />
                <Text style={styles.emptyTitle}>No Risk Factors</Text>
                <Text style={styles.emptySubtitle}>
                  Your health profile looks great!
                </Text>
              </GlassCard>
            )}
          </Animated.View>

          {/* Recommendations */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            <GlassCard style={styles.recommendationsCard}>
              <View style={styles.recommendation}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="fitness" size={20} color={colors.success[400]} />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>Increase Daily Exercise</Text>
                  <Text style={styles.recommendationDescription}>
                    Add 15 minutes of cardio to improve cardiovascular health
                  </Text>
                </View>
              </View>
              
              <View style={styles.recommendationDivider} />
              
              <View style={styles.recommendation}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="water" size={20} color={colors.info[400]} />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>Stay Hydrated</Text>
                  <Text style={styles.recommendationDescription}>
                    Drink 8-10 glasses of water daily for optimal health
                  </Text>
                </View>
              </View>
              
              <View style={styles.recommendationDivider} />
              
              <View style={styles.recommendation}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="moon" size={20} color={colors.secondary[400]} />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>Improve Sleep Quality</Text>
                  <Text style={styles.recommendationDescription}>
                    Maintain 7-8 hours of quality sleep for better recovery
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  shareButton: {
    padding: spacing.sm,
  },
  
  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  // Health score card
  healthScoreCard: {
    overflow: 'hidden',
  },
  healthScoreGradient: {
    padding: spacing.xl,
  },
  healthScoreContent: {
    alignItems: 'center',
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  healthScoreTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  healthScoreValue: {
    fontSize: typography.fontSizes.display,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  healthScoreSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  healthScoreProgress: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.text,
    borderRadius: 3,
  },
  
  // Timeframe selector
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 25,
    padding: spacing.xs,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  timeframeTextActive: {
    color: colors.text,
  },
  
  // Chart styles
  chartCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  
  // Generate button
  generateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  // Prediction card
  predictionCard: {
    marginBottom: spacing.md,
  },
  
  // Risk card
  riskCard: {
    marginBottom: spacing.md,
  },
  
  // Empty state
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Recommendations
  recommendationsCard: {
    padding: spacing.lg,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recommendationDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  recommendationDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});

export default HealthTwinScreen;