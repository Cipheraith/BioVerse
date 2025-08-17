import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GradientButton from '../../components/ui/GradientButton';
import BioVerseLogo from '../../components/ui/BioVerseLogo';
// import FloatingParticles from '../../components/animations/FloatingParticles';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Main fade and slide animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGetStarted = () => {
    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* <FloatingParticles particleCount={20} /> */}
        
        <View style={styles.content}>
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* BioVerse Logo */}
            <BioVerseLogo 
              size={120} 
              showText={true} 
              animated={true}
              style={styles.logoContainer}
            />
            
            <View style={styles.heroDescription}>
              <Text style={styles.heroText}>
                Experience revolutionary healthcare through AI-powered insights, 
                blockchain security, and immersive AR/VR medical experiences.
              </Text>
            </View>
          </Animated.View>

          {/* Features Showcase */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.featuresTitle}>Revolutionary Features</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={gradients.ai}
                    style={styles.featureIcon}
                  >
                    <Ionicons name="brain" size={24} color={colors.text} />
                  </LinearGradient>
                  <Text style={styles.featureTitle}>Quantum AI</Text>
                  <Text style={styles.featureDesc}>95%+ accurate health predictions</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={gradients.primary}
                    style={styles.featureIcon}
                  >
                    <Ionicons name="cube" size={24} color={colors.text} />
                  </LinearGradient>
                  <Text style={styles.featureTitle}>Blockchain</Text>
                  <Text style={styles.featureDesc}>Immutable health records</Text>
                </View>
              </View>
              
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={gradients.secondary}
                    style={styles.featureIcon}
                  >
                    <Ionicons name="glasses" size={24} color={colors.text} />
                  </LinearGradient>
                  <Text style={styles.featureTitle}>AR/VR</Text>
                  <Text style={styles.featureDesc}>Immersive medical experiences</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={gradients.success}
                    style={styles.featureIcon}
                  >
                    <Ionicons name="phone-portrait" size={24} color={colors.text} />
                  </LinearGradient>
                  <Text style={styles.featureTitle}>IoT Devices</Text>
                  <Text style={styles.featureDesc}>1000+ device integrations</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>AI Accuracy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1000+</Text>
                <Text style={styles.statLabel}>IoT Devices</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Monitoring</Text>
              </View>
            </View>
          </Animated.View>

          {/* CTA Section */}
          <Animated.View
            style={[
              styles.ctaSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <GradientButton
              title="Start Your Health Revolution"
              gradient={gradients.primary}
              style={styles.ctaButton}
              onPress={handleGetStarted}
              icon={<Ionicons name="rocket" size={20} color={colors.text} />}
            />
            
            <Text style={styles.ctaSubtext}>
              Join the future of healthcare • Free to start
            </Text>
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  
  // Hero section
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  heroDescription: {
    paddingHorizontal: spacing.md,
  },
  heroText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  
  // Features section
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
  },
  featuresTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featuresList: {
    // Features list styles
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  
  // Stats section
  statsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[400],
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  
  // CTA section
  ctaSection: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  ctaButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  ctaSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default OnboardingScreen;