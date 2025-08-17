import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import BioVerseLogo from '../../components/ui/BioVerseLogo';
import GlassCard from '../../components/ui/GlassCard';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const DemoMenuScreen = ({ navigation }) => {
  const demoScreens = [
    {
      id: 'logo',
      title: 'Logo Demo',
      description: 'Interactive logo showcase with your custom bio.png',
      icon: 'image',
      gradient: gradients.primary,
      screen: 'LogoDemo',
    },
    {
      id: 'emergency',
      title: 'Emergency System',
      description: 'Advanced emergency response with AI coordination',
      icon: 'medical',
      gradient: gradients.error,
      screen: 'Emergency',
    },
    {
      id: 'onboarding',
      title: 'Onboarding Flow',
      description: 'Revolutionary healthcare introduction experience',
      icon: 'rocket',
      gradient: gradients.secondary,
      screen: 'Onboarding',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <BioVerseLogo size={60} showText={false} animated={true} />
          <Text style={styles.headerTitle}>BioVerse Demo</Text>
          <Text style={styles.headerSubtitle}>
            Experience the future of healthcare
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Demo Screens */}
          <View style={styles.demosSection}>
            <Text style={styles.sectionTitle}>Available Demos</Text>
            
            {demoScreens.map((demo) => (
              <TouchableOpacity
                key={demo.id}
                style={styles.demoCard}
                onPress={() => navigation.navigate(demo.screen)}
              >
                <GlassCard style={styles.demoContent}>
                  <LinearGradient
                    colors={demo.gradient}
                    style={styles.demoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.demoHeader}>
                      <View style={styles.demoIcon}>
                        <Ionicons name={demo.icon} size={32} color={colors.text} />
                      </View>
                      <View style={styles.demoInfo}>
                        <Text style={styles.demoTitle}>{demo.title}</Text>
                        <Text style={styles.demoDescription}>
                          {demo.description}
                        </Text>
                      </View>
                      <View style={styles.demoArrow}>
                        <Ionicons name="chevron-forward" size={24} color={colors.text} />
                      </View>
                    </View>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          {/* Features Overview */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            
            <GlassCard style={styles.featuresCard}>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.featureText}>Custom logo integration</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.featureText}>Smooth animations & transitions</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.featureText}>Glass morphism UI design</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.featureText}>Emergency response system</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.featureText}>Quantum AI integration ready</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[400]} />
                  <Text style={styles.featureText}>Blockchain security foundation</Text>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Tech Stack */}
          <View style={styles.techSection}>
            <Text style={styles.sectionTitle}>Technology Stack</Text>
            
            <View style={styles.techGrid}>
              <GlassCard style={styles.techCard}>
                <Ionicons name="logo-react" size={32} color={colors.info[400]} />
                <Text style={styles.techTitle}>React Native</Text>
                <Text style={styles.techDesc}>Cross-platform mobile</Text>
              </GlassCard>
              
              <GlassCard style={styles.techCard}>
                <Ionicons name="color-palette" size={32} color={colors.secondary[400]} />
                <Text style={styles.techTitle}>Expo</Text>
                <Text style={styles.techDesc}>Development platform</Text>
              </GlassCard>
              
              <GlassCard style={styles.techCard}>
                <Ionicons name="cube" size={32} color={colors.primary[400]} />
                <Text style={styles.techTitle}>Glass UI</Text>
                <Text style={styles.techDesc}>Modern design system</Text>
              </GlassCard>
              
              <GlassCard style={styles.techCard}>
                <Ionicons name="flash" size={32} color={colors.warning[400]} />
                <Text style={styles.techTitle}>Animations</Text>
                <Text style={styles.techDesc}>Smooth interactions</Text>
              </GlassCard>
            </View>
          </View>
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
  
  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Sections
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Demos section
  demosSection: {
    marginBottom: spacing.xl,
  },
  demoCard: {
    marginBottom: spacing.md,
  },
  demoContent: {
    overflow: 'hidden',
  },
  demoGradient: {
    padding: spacing.lg,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  demoInfo: {
    flex: 1,
  },
  demoTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  demoDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    opacity: 0.8,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  demoArrow: {
    marginLeft: spacing.md,
  },
  
  // Features section
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featuresCard: {
    padding: spacing.lg,
  },
  featuresList: {
    // Features list styles
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  
  // Tech section
  techSection: {
    marginBottom: spacing.xl,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techCard: {
    width: '48%',
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  techTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  techDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DemoMenuScreen;