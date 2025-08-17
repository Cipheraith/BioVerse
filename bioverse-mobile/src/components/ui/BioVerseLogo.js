import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography } from '../../constants/theme';

// Logo image path - you'll need to copy bio.png to assets/images/
const logoImage = require('../../assets/images/bio.png');

const BioVerseLogo = ({ 
  size = 80, 
  showText = true, 
  animated = true,
  style = {},
  textStyle = {},
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      startAnimations();
    }
  }, [animated]);

  const startAnimations = () => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const logoSize = size;
  const fontSize = size * 0.5;

  return (
    <View style={[styles.container, style]}>
      {/* Glow Effect */}
      {animated && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: logoSize + 20,
              height: logoSize + 20,
              opacity: glowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(138, 43, 226, 0.4)',
              'rgba(75, 0, 130, 0.3)',
              'rgba(138, 43, 226, 0.4)',
            ]}
            style={[
              styles.glow,
              {
                width: logoSize + 20,
                height: logoSize + 20,
                borderRadius: (logoSize + 20) / 2,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            width: logoSize,
            height: logoSize,
            transform: animated ? [
              { rotate },
              { scale: pulseAnim },
            ] : [],
          },
        ]}
      >
        <LinearGradient
          colors={gradients.primary}
          style={[
            styles.logo,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* BioVerse Logo Image */}
          <Image
            source={logoImage}
            style={[
              styles.logoImage,
              {
                width: logoSize * 0.8,
                height: logoSize * 0.8,
              },
            ]}
            resizeMode="contain"
          />
          
          {/* Quantum Particles Overlay */}
          <View style={styles.particlesContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Logo Text */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.logoText, textStyle]}>BioVerse</Text>
          <Text style={[styles.tagline, textStyle]}>The Future of Healthcare</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoImage: {
    zIndex: 2,
    tintColor: colors.text, // This will apply a tint to match the theme
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text,
    opacity: 0.7,
  },
  particle1: {
    top: '20%',
    left: '15%',
    backgroundColor: colors.secondary[400],
  },
  particle2: {
    top: '70%',
    right: '20%',
    backgroundColor: colors.accent[400],
  },
  particle3: {
    bottom: '25%',
    left: '70%',
    backgroundColor: colors.info[400],
  },
  textContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[400],
    textAlign: 'center',
  },
});

export default BioVerseLogo;