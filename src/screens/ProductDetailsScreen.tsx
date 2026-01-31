import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../types';
import NutrientCard from '../components/NutrientCard';

type ProductDetailsScreenProps = StackScreenProps<RootStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route, navigation }: ProductDetailsScreenProps) {
  const { item } = route.params;

  const getQualityColor = (score: number) => {
    if (score >= 80) return theme.colors.text;
    if (score >= 60) return theme.colors.secondary;
    return theme.colors.text;
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderQualityScore = () => {
    const score = item.qualityScore;
    const circumference = 2 * Math.PI * 80;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

    return (
      <View style={styles.qualityContainer}>
        <View style={styles.scoreCircleContainer}>
          <View style={styles.scoreCircle}>
            <View style={[styles.scoreInner, { backgroundColor: getQualityColor(score) }]} />
            <View style={styles.scoreProgress}>
              <View 
                style={[
                  styles.scoreBar,
                  { 
                    width: `${score}%`,
                    backgroundColor: getQualityColor(score)
                  }
                ]} 
              />
            </View>
          </View>
          <View style={styles.scoreTextContainer}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreTotal}>/100</Text>
          </View>
        </View>
        <View style={styles.scoreLabelContainer}>
          <Text style={[styles.scoreLabel, { color: getQualityColor(score) }]}>
            {getQualityLabel(score)}
          </Text>
          <Text style={styles.scoreDescription}>Nutrient Quality Score</Text>
        </View>
      </View>
    );
  };

  const renderNutrientGrid = () => {
    if (!item.nutrients) return null;

    const { nutrients } = item;
    const allNutrients = [
      { name: 'Calories', value: nutrients.calories.value, unit: nutrients.calories.unit },
      { name: 'Protein', value: nutrients.protein.value, unit: nutrients.protein.unit },
      { name: 'Carbs', value: nutrients.carbs.value, unit: nutrients.carbs.unit },
      { name: 'Fat', value: nutrients.fat.value, unit: nutrients.fat.unit },
      { name: 'Fiber', value: nutrients.fiber.value, unit: nutrients.fiber.unit },
      { name: 'Sugar', value: nutrients.sugar.value, unit: nutrients.sugar.unit },
      { name: 'Sodium', value: nutrients.sodium.value, unit: nutrients.sodium.unit },
    ];

    return (
      <View style={styles.nutrientsSection}>
        <Text style={styles.sectionTitle}>Nutrition Facts</Text>
        <Text style={styles.servingInfo}>Per {nutrients.calories.per}</Text>
        <View style={styles.nutrientGrid}>
          {allNutrients.map((nutrient, index) => (
            <NutrientCard
              key={index}
              name={nutrient.name}
              value={nutrient.value}
              unit={nutrient.unit}
              size="large"
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>

        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.brandName}>{item.brand}</Text>
          <Text style={styles.barcode}>Barcode: {item.barcode}</Text>
          <Text style={styles.timestamp}>Scanned {formatTimestamp(item.timestamp)}</Text>
        </View>

        {renderQualityScore()}
        {renderNutrientGrid()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  backButtonContainer: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight,
    color: theme.colors.text,
  },
  productHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  brandName: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  barcode: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  qualityContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  scoreInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
  },
  scoreProgress: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: theme.colors.disabled,
    borderRadius: 2,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 2,
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 36,
  },
  scoreTotal: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: -4,
  },
  scoreLabelContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  scoreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  nutrientsSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.subheading.fontSize,
    fontWeight: theme.typography.subheading.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  servingInfo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
});