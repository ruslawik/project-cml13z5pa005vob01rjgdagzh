import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface NutrientCardProps {
  name: string;
  value: number;
  unit: string;
  dailyValue?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function NutrientCard({ name, value, unit, dailyValue, size = 'medium' }: NutrientCardProps) {
  const getContainerStyle = () => {
    switch (size) {
      case 'small':
        return [styles.container, styles.containerSmall];
      case 'large':
        return [styles.container, styles.containerLarge];
      default:
        return styles.container;
    }
  };

  const getValueStyle = () => {
    switch (size) {
      case 'small':
        return [styles.value, styles.valueSmall];
      case 'large':
        return [styles.value, styles.valueLarge];
      default:
        return styles.value;
    }
  };

  return (
    <View style={getContainerStyle()}>
      <Text style={getValueStyle()}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.name}>{name}</Text>
      {dailyValue && (
        <Text style={styles.dailyValue}>{dailyValue}% DV</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
    marginHorizontal: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerSmall: {
    padding: 8,
    minWidth: 80,
  },
  containerLarge: {
    padding: 16,
    minWidth: 120,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  valueSmall: {
    fontSize: 16,
  },
  valueLarge: {
    fontSize: 24,
  },
  unit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  name: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  dailyValue: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});