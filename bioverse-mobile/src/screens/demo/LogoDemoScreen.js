import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import BioVerseLogo from '../../components/ui/BioVerseLogo';
import GlassCard from '../../components/ui/GlassCard';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const LogoDemoScreen = ({ navigation }) => {
  const [selectedSize, setSelectedSize] = useState(100);
  const [showText, setShowText] = useState(true);
  const [animated, setAnimated] = useState(true);

  const logoSizes = [60, 80, 100, 120, 150];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BioVerse Logo Demo</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Logo Display */}
          <View style={styles.logoSection}>
            <GlassCard style={styles.logoCard}>
              <BioVerseLogo 
                size={selectedSize} 
                showText={showText} 
                animated={animated}
              />
            </GlassCard>
          </View>

          {/* Controls Section */}
          <View style={styles.controlsSection}>
            <Text style={styles.sectionTitle}>Logo Controls</Text>
            
            {/* Size Control */}
            <GlassCard style={styles.controlCard}>
              <Text style={styles.controlLabel}>Size: {selectedSize}px</Text>
              <View style={styles.sizeButtons}>
                {logoSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      selectedSize === size && styles.sizeButtonActive,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.sizeButtonText,
                      selectedSize === size && styles.sizeButtonTextActive,
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* Toggle Controls */}
            <GlassCard style={styles.controlCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.controlLabel}>Show Text</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    showText && styles.toggleActive,
                  ]}
                  onPress={() => setShowText(!showText)}
                >
                  <View style={[
                    styles.toggleThumb,
                    showText && styles.toggleThumbActive,
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.controlLabel}>Animated</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    animated && styles.toggleActive,
                  ]}
                  onPress={() => setAnimated(!animated)}
                >
                  <View style={[
                    styles.toggleThumb,
                    animated && styles.toggleThumbActive,
                  ]} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>

          {/* Logo Variations */}
          <View style={styles.variationsSection}>
            <Text style={styles.sectionTitle}>Logo Variations</Text>
            
            <View style={styles.variationsGrid}>
              {/* Small Logo */}
              <GlassCard style={styles.variationCard}>
                <Text style={styles.variationTitle}>Small</Text>
                <BioVerseLogo size={60} showText={false} animated={false} />
              </GlassCard>

              {/* Medium Logo */}
              <GlassCard style={styles.variationCard}>
                <Text style={styles.variationTitle}>Medium</Text>
                <BioVerseLogo size={80} showText={false} animated={true} />
              </GlassCard>

              {/* Large Logo */}
              <GlassCard style={styles.variationCard}>
                <Text style={styles.variationTitle}>Large</Text>
                <BioVerseLogo size={100} showText={true} animated={true} />
              </GlassCard>
            </View>
          </View>

          {/* Logo Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Logo Information</Text>
            
            <GlassCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="image" size={20} color={colors.primary[400]} />
                <Text style={styles.infoText}>
                  Using your custom bio.png logo
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="color-palette" size={20} color={colors.secondary[400]} />
                <Text style={styles.infoText}>
                  Adaptive theming with gradient overlays
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="play" size={20} color={colors.success[400]} />
                <Text style={styles.infoText}>
                  Smooth rotation and pulse animations
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="resize" size={20} color={colors.info[400]} />
                <Text style={styles.infoText}>
                  Scalable from 40px to 200px
                </Text>
              </View>
            </GlassCard>
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
  placeholder: {
    width: 40,
  },
  
  // Scroll view
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
  logoCard: {
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  
  // Controls section
  controlsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  controlCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  controlLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Size controls
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sizeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[400],
  },
  sizeButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  sizeButtonTextActive: {
    color: colors.text,
  },
  
  // Toggle controls
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  
  // Variations section
  variationsSection: {
    marginBottom: spacing.xl,
  },
  variationsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  variationCard: {
    flex: 1,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  variationTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  
  // Info section
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
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

export default LogoDemoScreen;