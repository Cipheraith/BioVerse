import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

import GlassCard from './GlassCard';
import { colors, spacing, typography } from '../../constants/theme';

const QuickActionButton = ({ 
  icon, 
  title, 
  subtitle, 
  gradient, 
  onPress,
  style 
}) => {
  return (
    <Animated.View style={style}>
      <TouchableOpacity onPress={onPress}>
        <GlassCard style={styles.card}>
          <LinearGradient
            colors={gradient}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={28} color={colors.text} />
            </View>
            
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            
            <View style={styles.arrow}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 80,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});

export default QuickActionButton;