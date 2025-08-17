import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const EmergencyButton = ({ onPress, disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef(null);

  useEffect(() => {
    startPulseAnimation();
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const startRippleAnimation = () => {
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    if (disabled) return;
    
    setIsPressed(true);
    Vibration.vibrate([0, 100, 50, 100]);
    
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    startRippleAnimation();
    startCountdown();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsPressed(false);
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      setCountdown(null);
    }
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        setIsPressed(false);
        
        // Trigger emergency
        Vibration.vibrate([0, 200, 100, 200, 100, 200]);
        onPress && onPress();
      } else {
        Vibration.vibrate(50);
      }
    }, 1000);
  };

  const handlePress = () => {
    if (disabled) return;

    Alert.alert(
      '🚨 Emergency Alert',
      'Hold the button for 3 seconds to activate emergency protocol.\n\nThis will:\n• Contact emergency services\n• Notify your emergency contacts\n• Share your location\n• Activate medical monitoring',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Quick Activate',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate([0, 200, 100, 200]);
            onPress && onPress();
          },
        },
      ]
    );
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.4, 0],
  });

  return (
    <View style={styles.container}>
      {/* Emergency Instructions */}
      <Text style={styles.instructionText}>
        {isPressed && countdown ? 
          `Releasing in ${countdown}...` : 
          'Hold for 3 seconds to activate emergency'
        }
      </Text>

      {/* Emergency Button */}
      <View style={styles.buttonContainer}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={gradients.error}
            style={styles.rippleGradient}
          />
        </Animated.View>

        {/* Main Button */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              transform: [
                { scale: Animated.multiply(pulseAnim, scaleAnim) },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            disabled={disabled}
          >
            <LinearGradient
              colors={disabled ? gradients.disabled : gradients.error}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Emergency Icon */}
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="medical" 
                  size={60} 
                  color={colors.text} 
                />
                <View style={styles.crossIcon}>
                  <View style={styles.crossHorizontal} />
                  <View style={styles.crossVertical} />
                </View>
              </View>

              {/* Emergency Text */}
              <Text style={styles.emergencyText}>
                EMERGENCY
              </Text>

              {/* Countdown Display */}
              {isPressed && countdown && (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>
                    {countdown}
                  </Text>
                </View>
              )}

              {/* Status Indicator */}
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: disabled ? colors.gray[500] : colors.success[500] }
                ]} />
                <Text style={styles.statusText}>
                  {disabled ? 'DISABLED' : 'READY'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Outer Ring */}
        <View style={styles.outerRing}>
          <LinearGradient
            colors={['rgba(255, 0, 0, 0.3)', 'rgba(255, 0, 0, 0.1)']}
            style={styles.outerRingGradient}
          />
        </View>
      </View>

      {/* Warning Text */}
      <Text style={styles.warningText}>
        ⚠️ Only use in genuine medical emergencies
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  instructionText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  buttonWrapper: {
    elevation: 20,
    shadowColor: colors.error[500],
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  crossIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossHorizontal: {
    width: 20,
    height: 4,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  crossVertical: {
    position: 'absolute',
    width: 4,
    height: 20,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  emergencyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  countdownContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.error[600],
  },
  statusIndicator: {
    position: 'absolute',
    bottom: spacing.md,
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
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    opacity: 0.8,
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  outerRingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  warningText: {
    fontSize: typography.fontSizes.sm,
    color: colors.warning[400],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    fontStyle: 'italic',
  },
});

export default EmergencyButton;