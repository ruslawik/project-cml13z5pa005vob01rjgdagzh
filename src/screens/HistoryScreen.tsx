import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScannedItem } from '../types';
import { theme } from '../constants/theme';
import NutrientCard from '../components/NutrientCard';

const STORAGE_KEY = '@scanned_items_history';

// Sample hardcoded data to demonstrate app functionality
const sampleHistoryItems: ScannedItem[] = [
  {
    id: '1',
    barcode: '0123456789012',
    productName: 'Organic Whole Wheat Bread',
    brand: 'Nature\'s Best',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    qualityScore: 85,
    nutrients: {
      calories: { value: 80, unit: 'kcal', per: 'slice' },
      protein: { value: 4, unit: 'g', per: 'slice' },
      carbs: { value: 15, unit: 'g', per: 'slice' },
      fat: { value: 1, unit: 'g', per: 'slice' },
      fiber: { value: 3, unit: 'g', per: 'slice' },
      sugar: { value: 1, unit: 'g', per: 'slice' },
      sodium: { value: 140, unit: 'mg', per: 'slice' },
    },
  },
  {
    id: '2',
    barcode: '9876543210987',
    productName: 'Greek Yogurt Vanilla',
    brand: 'Dairy Fresh',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    qualityScore: 78,
    nutrients: {
      calories: { value: 120, unit: 'kcal', per: '150g' },
      protein: { value: 15, unit: 'g', per: '150g' },
      carbs: { value: 12, unit: 'g', per: '150g' },
      fat: { value: 2, unit: 'g', per: '150g' },
      fiber: { value: 0, unit: 'g', per: '150g' },
      sugar: { value: 10, unit: 'g', per: '150g' },
      sodium: { value: 65, unit: 'mg', per: '150g' },
    },
  },
  {
    id: '3',
    barcode: '4567891234567',
    productName: 'Dark Chocolate Bar 70%',
    brand: 'Pure Cacao',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    qualityScore: 92,
    nutrients: {
      calories: { value: 170, unit: 'kcal', per: '30g' },
      protein: { value: 3, unit: 'g', per: '30g' },
      carbs: { value: 12, unit: 'g', per: '30g' },
      fat: { value: 12, unit: 'g', per: '30g' },
      fiber: { value: 4, unit: 'g', per: '30g' },
      sugar: { value: 7, unit: 'g', per: '30g' },
      sodium: { value: 5, unit: 'mg', per: '30g' },
    },
  },
];

export default function HistoryScreen() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      let items: ScannedItem[] = [];
      
      if (storedItems) {
        items = JSON.parse(storedItems);
      } else {
        // If no stored items, use sample data to demonstrate functionality
        items = sampleHistoryItems;
        // Store sample data for persistence
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sampleHistoryItems));
      }
      
      // Sort by timestamp, most recent first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setScannedItems(items);
    } catch (error) {
      console.error('Error loading history:', error);
      // Fallback to sample data if storage fails
      setScannedItems(sampleHistoryItems);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setScannedItems([]);
      setExpandedItems([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return theme.colors.text;
    if (score >= 60) return theme.colors.secondary;
    return theme.colors.text;
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNutrientInfo = (item: ScannedItem) => {
    if (!item.nutrients) return null;

    const { nutrients } = item;
    const mainNutrients = [
      { name: 'Calories', value: nutrients.calories.value, unit: nutrients.calories.unit },
      { name: 'Protein', value: nutrients.protein.value, unit: nutrients.protein.unit },
      { name: 'Carbs', value: nutrients.carbs.value, unit: nutrients.carbs.unit },
      { name: 'Fat', value: nutrients.fat.value, unit: nutrients.fat.unit },
    ];

    const detailNutrients = [
      { name: 'Fiber', value: nutrients.fiber.value, unit: nutrients.fiber.unit },
      { name: 'Sugar', value: nutrients.sugar.value, unit: nutrients.sugar.unit },
      { name: 'Sodium', value: nutrients.sodium.value, unit: nutrients.sodium.unit },
    ];

    return (
      <View style={styles.nutrientSection}>
        <Text style={styles.nutrientTitle}>Nutrition per {nutrients.calories.per}</Text>
        <View style={styles.nutrientGrid}>
          {mainNutrients.map((nutrient, index) => (
            <NutrientCard
              key={index}
              name={nutrient.name}
              value={nutrient.value}
              unit={nutrient.unit}
              size="small"
            />
          ))}
        </View>
        <View style={styles.nutrientGrid}>
          {detailNutrients.map((nutrient, index) => (
            <NutrientCard
              key={index}
              name={nutrient.name}
              value={nutrient.value}
              unit={nutrient.unit}
              size="small"
            />
          ))}
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: ScannedItem }) => {
    const isExpanded = expandedItems.includes(item.id);

    return (
      <View style={styles.historyItem}>
        <TouchableOpacity 
          style={styles.itemHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.itemInfo}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.brandName}>{item.brand}</Text>
            <Text style={styles.barcode}>Barcode: {item.barcode}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <View style={styles.itemActions}>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(item.qualityScore) }]}>
              <Text style={styles.qualityText}>{item.qualityScore}</Text>
            </View>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={theme.colors.textSecondary}
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>
        {isExpanded && renderNutrientInfo(item)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (scannedItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="scan-outline" size={80} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>No scanned items yet</Text>
        <Text style={styles.emptySubtitle}>Start scanning barcodes to see your history here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History ({scannedItems.length})</Text>
        <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={scannedItems}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearText: {
    color: theme.colors.text,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  brandName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  barcode: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  qualityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  expandIcon: {
    marginLeft: 8,
  },
  nutrientSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  nutrientTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    marginTop: 16,
  },
  nutrientGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
});