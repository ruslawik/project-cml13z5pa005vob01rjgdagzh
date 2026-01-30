import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../constants/theme';

interface NutrientCardProps {
  name: string;
  value: number;
  unit: string;
}

export default function NutrientCard({ name, value, unit }: NutrientCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    minWidth: 100,
    flex: 1,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: theme.colors.primary,
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
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
};