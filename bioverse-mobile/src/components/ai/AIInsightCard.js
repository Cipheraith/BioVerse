import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

import GlassCard from '../ui/GlassCard';
import { colors, gradients, spacing, typography } from '../../constants/theme';

const AIInsightCard = ({ insights = [], style, onInsightPress }) => {
  if (!insights || insights.length === 0) {
    return (
      <Animated.View style={style}>
        <GlassCard style={styles.card}>
          <LinearGradient
            colors={gradients.ai}
            style={styles.emptyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emptyContent}>
              <Ionicons name="brain" size={48} color={colors.text} />
              <Text style={styles.emptyTitle}>AI Analysis in Progress</Text>
              <Text style={styles.emptySubtitle}>
                Your personalized health insights will appear here
              </Text>
            </View>
          </LinearGradient>
        </GlassCard>
      </Animated.View>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return colors.error[400];
      case 'medium':
        return colors.warning[400];
      case 'low':
        return colors.success[400];
      default:
        return colors.info[400];
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'warning';
      case 'low':
        return 'information-circle';
      default:
        return 'bulb';
    }
  };

  return (
    <Animated.View style={style}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="brain" size={24} color={colors.primary[400]} />
          </View>
          <Text style={styles.headerTitle}>AI Health Insights</Text>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.aiText}>AI</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {insights.map((insight, index) => (
            <TouchableOpacity
              key={insight.id || index}
              style={[
                styles.insightItem,
                index === insights.length - 1 && styles.lastInsightItem
              ]}
              onPress={() => onInsightPress && onInsightPress(insight)}
            >
              <View style={styles.insightHeader}>
                <View style={[
                  styles.insightIcon,
                  { backgroundColor: `${getPriorityColor(insight.priority)}20` }
                ]}>
                  <Ionicons 
                    name={insight.icon || getPriorityIcon(insight.priority)} 
                    size={20} 
                    color={getPriorityColor(insight.priority)} 
                  />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
                <View style={styles.priorityBadge}>
                  <View style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(insight.priority) }
                  ]} />
                </View>
              </View>
              
              {insight.actionable && (
                <View style={styles.actionContainer}>
                  <Text style={styles.actionText}>{insight.action}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary[400]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Insights</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[400],
    marginRight: spacing.xs,
  },
  aiText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[400],
  },
  
  // Scroll view
  scrollView: {
    maxHeight: 200,
  },
  
  // Insight item styles
  insightItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastInsightItem: {
    borderBottomWidth: 0,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  priorityBadge: {
    marginLeft: spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Action container
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginLeft: 44, // Align with content
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[400],
  },
  
  // Footer styles
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[400],
    marginRight: spacing.xs,
  },
  
  // Empty state styles
  emptyGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyContent: {
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
});

export default AIInsightCard;