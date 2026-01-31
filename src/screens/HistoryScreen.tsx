import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScannedItem } from '../types';
import { theme } from '../constants/theme';

const STORAGE_KEY = '@scanned_items_history';

export default function HistoryScreen() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        const items: ScannedItem[] = JSON.parse(storedItems);
        // Sort by timestamp, most recent first
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setScannedItems(items);
      }
    } catch (error) {
      console.error('Error loading history:', error);
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

  const getQualityColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
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

  const renderHistoryItem = ({ item }: { item: ScannedItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.brandName}>{item.brand}</Text>
        <Text style={styles.barcode}>Barcode: {item.barcode}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(item.qualityScore) }]}>
        <Text style={styles.qualityText}>{item.qualityScore}</Text>
      </View>
    </View>
  );

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
        <Ionicons name="scan-outline" size={64} color={theme.colors.textSecondary} />
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
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
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
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearText: {
    color: theme.colors.error,
    marginLeft: 4,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  barcode: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  qualityBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});