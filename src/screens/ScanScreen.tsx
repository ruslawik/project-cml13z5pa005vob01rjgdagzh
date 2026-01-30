import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import NutrientCard from '../components/NutrientCard';
import QualityScore from '../components/QualityScore';
import { theme } from '../constants/theme';
import { ProductInfo } from '../types';

// Mock data for demo purposes
const mockProductData: ProductInfo = {
  name: "Sample Cereal",
  brand: "HealthyBrand",
  barcode: "1234567890123",
  qualityScore: 75,
  nutrients: {
    calories: { value: 150, unit: "kcal", per: "100g" },
    protein: { value: 8.5, unit: "g", per: "100g" },
    carbs: { value: 60, unit: "g", per: "100g" },
    fat: { value: 2.1, unit: "g", per: "100g" },
    fiber: { value: 5.2, unit: "g", per: "100g" },
    sugar: { value: 12, unit: "g", per: "100g" },
    sodium: { value: 180, unit: "mg", per: "100g" },
  },
  healthWarnings: [
    "Contains high amount of sugar",
    "May contain traces of gluten"
  ],
  benefits: [
    "Good source of fiber",
    "Fortified with vitamins",
    "Low in fat"
  ]
};

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScannedProduct(mockProductData);
    }, 2000);
  };

  const handleScanAnother = () => {
    setScannedProduct(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!scannedProduct ? (
          <View style={styles.scanSection}>
            <View style={styles.cameraPlaceholder}>
              <Ionicons 
                name={isScanning ? "scan" : "camera"} 
                size={80} 
                color={isScanning ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={styles.cameraText}>
                {isScanning ? "Scanning..." : "Camera will be here"}
              </Text>
              <Text style={styles.cameraSubtext}>
                {isScanning 
                  ? "Hold steady while scanning barcode" 
                  : "Point your camera at a product barcode"
                }
              </Text>
            </View>

            <Button
              title={isScanning ? "Scanning..." : "Start Scanning"}
              onPress={handleStartScan}
              disabled={isScanning}
              icon={isScanning ? "scan" : "camera"}
              style={styles.scanButton}
            />

            <Text style={styles.infoText}>
              The camera will activate automatically when barcode scanning API is connected.
              For now, this demonstrates the interface with mock data.
            </Text>
          </View>
        ) : (
          <View style={styles.resultSection}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{scannedProduct.name}</Text>
              <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
              <Text style={styles.barcode}>Barcode: {scannedProduct.barcode}</Text>
            </View>

            <QualityScore score={scannedProduct.qualityScore} />

            <View style={styles.nutrientsSection}>
              <Text style={styles.sectionTitle}>Nutrients (per 100g)</Text>
              <View style={styles.nutrientsGrid}>
                <NutrientCard
                  name="Calories"
                  value={scannedProduct.nutrients.calories.value}
                  unit={scannedProduct.nutrients.calories.unit}
                />
                <NutrientCard
                  name="Protein"
                  value={scannedProduct.nutrients.protein.value}
                  unit={scannedProduct.nutrients.protein.unit}
                />
                <NutrientCard
                  name="Carbs"
                  value={scannedProduct.nutrients.carbs.value}
                  unit={scannedProduct.nutrients.carbs.unit}
                />
                <NutrientCard
                  name="Fat"
                  value={scannedProduct.nutrients.fat.value}
                  unit={scannedProduct.nutrients.fat.unit}
                />
                <NutrientCard
                  name="Fiber"
                  value={scannedProduct.nutrients.fiber.value}
                  unit={scannedProduct.nutrients.fiber.unit}
                />
                <NutrientCard
                  name="Sugar"
                  value={scannedProduct.nutrients.sugar.value}
                  unit={scannedProduct.nutrients.sugar.unit}
                />
              </View>
            </View>

            <View style={styles.healthSection}>
              <Text style={styles.sectionTitle}>Health Warnings</Text>
              {scannedProduct.healthWarnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons name="warning" size={16} color={theme.colors.error} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>

            <View style={styles.healthSection}>
              <Text style={styles.sectionTitle}>Health Benefits</Text>
              {scannedProduct.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Scan Another Product"
              onPress={handleScanAnother}
              icon="scan"
              variant="outline"
              style={styles.scanAnotherButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  scanSection: {
    alignItems: 'center' as const,
  },
  cameraPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed' as const,
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: 12,
  },
  cameraSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 8,
  },
  scanButton: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  resultSection: {
    gap: 20,
  },
  productHeader: {
    alignItems: 'center' as const,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    textAlign: 'center' as const,
  },
  productBrand: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  barcode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  nutrientsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  nutrientsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  healthSection: {
    gap: 8,
  },
  warningItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 4,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  benefitItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 4,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  scanAnotherButton: {
    marginTop: 10,
  },
};