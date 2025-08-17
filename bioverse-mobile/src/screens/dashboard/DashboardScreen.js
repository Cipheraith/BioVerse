import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Components
import GlassCard from '../../components/ui/GlassCard';
import HealthMetricCard from '../../components/health/HealthMetricCard';
import QuickActionButton from '../../components/ui/QuickActionButton';
import AIInsightCard from '../../components/ai/AIInsightCard';
import EmergencyButton from '../../components/emergency/EmergencyButton';

// Services
import { HealthService } from '../../services/HealthService';
import { IoTService } from '../../services/IoTService';
import { AIService } from '../../services/AIService';

// Constants
import { colors, gradients, spacing, typography, shadows } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    steps: 8547,
    calories: 2150,
    sleep: 7.5,
    stress: 'Low',
  });

  const [aiInsights, setAiInsights] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState(3);
  const [tokenBalance, setTokenBalance] = useState(1250);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    initializeDashboard();
    startAnimations();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Load health data
      const health = await HealthService.getLatestHealthData();
      if (health) setHealthData(health);

      // Load AI insights
      const insights = await AIService.getHealthInsights();
      if (insights) setAiInsights(insights);

      // Load device status
      const devices = await IoTService.getConnectedDevicesCount();
      if (devices) setConnectedDevices(devices);

      // Load token balance
      const tokens = await HealthService.getTokenBalance();
      if (tokens) setTokenBalance(tokens);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  const quickActions = [
    {
      icon: 'medical',
      title: 'Health Check',
      subtitle: 'AI Analysis',
      gradient: gradients.ai,
      onPress: () => navigation.navigate('HealthTwin'),
    },
    {
      icon: 'phone-portrait',
      title: 'IoT Devices',
      subtitle: `${connectedDevices} Connected`,
      gradient: gradients.info,
      onPress: () => navigation.navigate('IoTDevices'),
    },
    {
      icon: 'videocam',
      title: 'Telemedicine',
      subtitle: 'Consult Doctor',
      gradient: gradients.telemedicine,
      onPress: () => navigation.navigate('Telemedicine'),
    },
    {
      icon: 'glasses',
      title: 'AR/VR',
      subtitle: 'Medical VR',
      gradient: gradients.secondary,
      onPress: () => navigation.navigate('ARVR'),
    },
  ];

  const healthMetrics = [
    {
      icon: 'heart',
      title: 'Heart Rate',
      value: `${healthData.heartRate}`,
      unit: 'BPM',
      status: 'normal',
      gradient: gradients.error,
    },
    {
      icon: 'fitness',
      title: 'Blood Pressure',
      value: healthData.bloodPressure,
      unit: 'mmHg',
      status: 'normal',
      gradient: gradients.primary,
    },
    {
      icon: 'walk',
      title: 'Steps',
      value: healthData.steps.toLocaleString(),
      unit: 'steps',
      status: 'good',
      gradient: gradients.success,
    },
    {
      icon: 'flame',
      title: 'Calories',
      value: healthData.calories.toLocaleString(),
      unit: 'kcal',
      status: 'normal',
      gradient: gradients.warning,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.hero}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.userName}>Welcome to BioVerse</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => navigation.openDrawer()}
              >
                <Ionicons name="menu-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary[400]}
            />
          }
        >
          {/* Emergency Button */}
          <Animated.View
            style={[
              styles.emergencySection,
              { opacity: fadeAnim },
            ]}
          >
            <EmergencyButton />
          </Animated.View>

          {/* Health Overview */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Health Overview</Text>
            <View style={styles.metricsGrid}>
              {healthMetrics.map((metric, index) => (
                <HealthMetricCard
                  key={index}
                  {...metric}
                  style={[styles.metricCard, { 
                    transform: [{ 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + (index * 10)],
                      })
                    }] 
                  }]}
                />
              ))}
            </View>
          </Animated.View>

          {/* AI Insights */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>AI Health Insights</Text>
            <AIInsightCard
              insights={aiInsights}
              style={{ transform: [{ translateY: slideAnim }] }}
            />
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  {...action}
                  style={[styles.quickAction, {
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + (index * 5)],
                      })
                    }]
                  }]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Token Balance */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <GlassCard style={styles.tokenCard}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.tokenGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.tokenContent}>
                  <View style={styles.tokenHeader}>
                    <Ionicons name="wallet" size={32} color={colors.text} />
                    <Text style={styles.tokenTitle}>BVH Tokens</Text>
                  </View>
                  <Text style={styles.tokenBalance}>{tokenBalance.toLocaleString()}</Text>
                  <Text style={styles.tokenSubtitle}>Health Rewards Earned</Text>
                  <TouchableOpacity 
                    style={styles.tokenButton}
                    onPress={() => navigation.navigate('Tokens')}
                  >
                    <Text style={styles.tokenButtonText}>View Wallet</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </GlassCard>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <GlassCard style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="heart" size={20} color={colors.error[400]} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Heart Rate Monitored</Text>
                  <Text style={styles.activityTime}>2 minutes ago</Text>
                </View>
                <Text style={styles.activityValue}>72 BPM</Text>
              </View>
              
              <View style={styles.activityDivider} />
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="walk" size={20} color={colors.success[400]} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Daily Steps Goal</Text>
                  <Text style={styles.activityTime}>5 minutes ago</Text>
                </View>
                <Text style={styles.activityValue}>85%</Text>
              </View>
              
              <View style={styles.activityDivider} />
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="medical" size={20} color={colors.primary[400]} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>AI Health Analysis</Text>
                  <Text style={styles.activityTime}>1 hour ago</Text>
                </View>
                <Text style={styles.activityValue}>+50 BVH</Text>
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
  
  // Header styles
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  userName: {
    fontSize: typography.fontSizes.xl,
    color: colors.text,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error[500],
  },
  menuButton: {
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
  
  // Emergency section
  emergencySection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  
  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
  },
  
  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
  },
  
  // Token card
  tokenCard: {
    overflow: 'hidden',
  },
  tokenGradient: {
    padding: spacing.lg,
  },
  tokenContent: {
    alignItems: 'center',
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tokenTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  tokenBalance: {
    fontSize: typography.fontSizes.xxxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tokenSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    gap: spacing.sm,
  },
  tokenButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  
  // Activity card
  activityCard: {
    padding: spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  activityTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  activityValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[400],
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});

export default DashboardScreen;