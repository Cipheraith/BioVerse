import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import BioVerseLogo from '../../components/ui/BioVerseLogo';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const EmergencyScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for emergency elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleEmergencyActivation = () => {
    Alert.alert(
      '🚨 Emergency Activated',
      'Emergency response protocol initiated:\n\n' +
      '• Location shared with emergency services\n' +
      '• Medical history transmitted to hospital\n' +
      '• Emergency contacts notified\n' +
      '• Real-time health monitoring activated',
      [{ text: 'OK' }]
    );
  };

  const handleEmergencyCall = (phoneNumber) => {
    Alert.alert(
      'Emergency Call',
      `This would call ${phoneNumber} in a real emergency situation.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: colors.success[500] }]} />
            <Text style={styles.statusText}>READY</Text>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              { opacity: fadeAnim },
            ]}
          >
            <BioVerseLogo size={80} showText={false} animated={true} />
            <Text style={styles.logoText}>BioVerse Emergency</Text>
          </Animated.View>

          {/* Emergency Button */}
          <Animated.View
            style={[
              styles.emergencySection,
              { opacity: fadeAnim, transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={handleEmergencyActivation}
            >
              <LinearGradient
                colors={gradients.error}
                style={styles.emergencyGradient}
              >
                <Ionicons name="medical" size={60} color={colors.text} />
                <Text style={styles.emergencyText}>EMERGENCY</Text>
                <Text style={styles.emergencySubtext}>Tap to activate</Text>
              </LinearGradient>
            </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleEmergencyCall('911')}
              >
                <GlassCard style={styles.quickActionContent}>
                  <LinearGradient
                    colors={gradients.error}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="call" size={28} color={colors.text} />
                    <Text style={styles.quickActionTitle}>Call 911</Text>
                    <Text style={styles.quickActionSubtitle}>Emergency Services</Text>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleEmergencyCall('Doctor')}
              >
                <GlassCard style={styles.quickActionContent}>
                  <LinearGradient
                    colors={gradients.warning}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="medical" size={28} color={colors.text} />
                    <Text style={styles.quickActionTitle}>Call Doctor</Text>
                    <Text style={styles.quickActionSubtitle}>Primary Care</Text>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => Alert.alert('Location Shared', 'GPS coordinates shared with emergency contacts')}
              >
                <GlassCard style={styles.quickActionContent}>
                  <LinearGradient
                    colors={gradients.info}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="location" size={28} color={colors.text} />
                    <Text style={styles.quickActionTitle}>Share Location</Text>
                    <Text style={styles.quickActionSubtitle}>GPS Coordinates</Text>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleEmergencyCall('Poison Control')}
              >
                <GlassCard style={styles.quickActionContent}>
                  <LinearGradient
                    colors={gradients.secondary}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="warning" size={28} color={colors.text} />
                    <Text style={styles.quickActionTitle}>Poison Control</Text>
                    <Text style={styles.quickActionSubtitle}>1-800-222-1222</Text>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Emergency Info */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Emergency Features</Text>
            <GlassCard style={styles.infoCard}>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.infoText}>Instant emergency service connection</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.infoText}>Automatic location sharing</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.infoText}>Medical history transmission</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.infoText}>Emergency contact notification</Text>
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  
  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Logo section
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  
  // Emergency section
  emergencySection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emergencyButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: colors.error[500],
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  emergencyGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  emergencySubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  
  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  quickActionContent: {
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    opacity: 0.8,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Info section
  infoCard: {
    padding: spacing.lg,
  },
  infoList: {
    // Info list styles
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    flex: 1,
  },
});

export default EmergencyScreen;