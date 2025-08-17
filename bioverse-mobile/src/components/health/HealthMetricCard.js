import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

import GlassCard from '../ui/GlassCard';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const HealthMetricCard = ({ 
  icon, 
  title, 
  value, 
  unit, 
  status, 
  gradient, 
  onPress,
  style 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
      case 'normal':
        return colors.success[400];
      case 'warning':
        return colors.warning[400];
      case 'critical':
        return colors.error[400];
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
      case 'normal':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <Animated.View style={style}>
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <GlassCard style={styles.card}>
          <LinearGradient
            colors={gradient}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={colors.text} />
              </View>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={getStatusIcon(status)} 
                  size={16} 
                  color={getStatusColor(status)} 
                />
              </View>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.unit}>{unit}</Text>
            </View>
            
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.md,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    // Status icon styles
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  unit: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HealthMetricCard;