import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface QualityScoreProps {
  score: number;
}

export default function QualityScore({ score }: QualityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return 'checkmark-circle';
    if (score >= 60) return 'warning';
    return 'close-circle';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const scoreIcon = getScoreIcon(score);

  return (
    <View style={styles.container}>
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
      <View style={styles.scoreInfo}>
        <View style={styles.scoreHeader}>
          <Ionicons name={scoreIcon} size={24} color={scoreColor} />
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
        </View>
        <Text style={styles.scoreDescription}>Nutrient Quality Score</Text>
      </View>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  scoreMax: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: -4,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
};