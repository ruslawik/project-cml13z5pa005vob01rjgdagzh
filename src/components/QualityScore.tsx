import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { ProductInfo } from '../types';

interface QualityScoreProps {
  score: number;
  product?: ProductInfo;
}

export default function QualityScore({ score, product }: QualityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return 'checkmark-circle';
    if (score >= 60) return 'warning';
    return 'close-circle';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Outstanding nutritional profile';
    if (score >= 80) return 'Great nutritional quality';
    if (score >= 70) return 'Good nutritional balance';
    if (score >= 60) return 'Acceptable nutritional value';
    if (score >= 40) return 'Limited nutritional benefits';
    return 'Poor nutritional quality';
  };

  const getHealthSummary = (product?: ProductInfo) => {
    if (!product) return null;

    const benefitsCount = product.benefits.length;
    const warningsCount = product.healthWarnings.length;

    if (benefitsCount > warningsCount) {
      return { 
        icon: 'thumbs-up-outline', 
        text: `${benefitsCount} health benefit${benefitsCount > 1 ? 's' : ''}`,
        color: theme.colors.success 
      };
    } else if (warningsCount > benefitsCount) {
      return { 
        icon: 'thumbs-down-outline', 
        text: `${warningsCount} health concern${warningsCount > 1 ? 's' : ''}`,
        color: theme.colors.error 
      };
    } else {
      return { 
        icon: 'remove-circle-outline', 
        text: 'Neutral health impact',
        color: theme.colors.textSecondary 
      };
    }
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const scoreIcon = getScoreIcon(score);
  const scoreDescription = getScoreDescription(score);
  const healthSummary = getHealthSummary(product);

  // Calculate progress bar width (0-100%)
  const progressWidth = Math.min(Math.max(score, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.mainScoreSection}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]} />
        </View>
        
        <View style={styles.scoreInfo}>
          <View style={styles.scoreHeader}>
            <Ionicons name={scoreIcon} size={24} color={scoreColor} />
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
          </View>
          <Text style={styles.scoreDescription}>{scoreDescription}</Text>
          
          {healthSummary && (
            <View style={styles.healthSummary}>
              <Ionicons name={healthSummary.icon} size={16} color={healthSummary.color} />
              <Text style={[styles.healthSummaryText, { color: healthSummary.color }]}>
                {healthSummary.text}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressWidth}%`,
                backgroundColor: scoreColor 
              }
            ]} 
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>0</Text>
          <Text style={styles.progressLabelCenter}>Nutrition Quality Score</Text>
          <Text style={styles.progressLabel}>100</Text>
        </View>
      </View>

      {product && (
        <View style={styles.quickStatsSection}>
          <View style={styles.quickStat}>
            <Ionicons 
              name="flash" 
              size={16} 
              color={product.nutrients.calories.value > 300 ? theme.colors.warning : theme.colors.success} 
            />
            <Text style={styles.quickStatValue}>{product.nutrients.calories.value}</Text>
            <Text style={styles.quickStatLabel}>kcal</Text>
          </View>
          
          <View style={styles.quickStat}>
            <Ionicons 
              name="fitness" 
              size={16} 
              color={product.nutrients.protein.value >= 10 ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={styles.quickStatValue}>{product.nutrients.protein.value}g</Text>
            <Text style={styles.quickStatLabel}>protein</Text>
          </View>
          
          <View style={styles.quickStat}>
            <Ionicons 
              name="leaf" 
              size={16} 
              color={product.nutrients.fiber.value >= 5 ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={styles.quickStatValue}>{product.nutrients.fiber.value}g</Text>
            <Text style={styles.quickStatLabel}>fiber</Text>
          </View>
          
          <View style={styles.quickStat}>
            <Ionicons 
              name="water" 
              size={16} 
              color={product.nutrients.sugar.value <= 10 ? theme.colors.success : theme.colors.warning} 
            />
            <Text style={styles.quickStatValue}>{product.nutrients.sugar.value}g</Text>
            <Text style={styles.quickStatLabel}>sugar</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainScoreSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
    position: 'relative' as const,
  },
  scoreRing: {
    position: 'absolute' as const,
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 47,
    borderWidth: 3,
    opacity: 0.3,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  scoreMax: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  healthSummary: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  healthSummaryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginLeft: 6,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
  },
  progressLabelCenter: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500' as const,
  },
  quickStatsSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickStat: {
    alignItems: 'center' as const,
    flex: 1,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
};