import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ScannedItem, RootStackParamList } from '../types';
import { theme } from '../constants/theme';

const STORAGE_KEY = '@scanned_items_history';

type NavigationProp = StackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<NavigationProp>();

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
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleItemPress = (item: ScannedItem) => {
    navigation.navigate('ProductDetails', { item });
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

  const renderHistoryItem = ({ item }: { item: ScannedItem }) => {
    return (
      <View style={styles.historyItem}>
        <TouchableOpacity 
          style={styles.itemHeader}
          onPress={() => handleItemPress(item)}
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
              name="chevron-forward" 
              size={24} 
              color={theme.colors.textSecondary}
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Scan History</Text>
        {scannedItems.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearHistory}
            activeOpacity={0.7}
          >
            <View style={styles.clearButtonContainer}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={scannedItems}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight,
    color: theme.colors.text,
  },
  clearButton: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.md,
  },
  clearButtonContainer: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  clearButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  brandName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  barcode: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  itemActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  qualityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.surface,
  },
  expandIcon: {
    marginLeft: theme.spacing.xs,
  },
});