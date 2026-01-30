import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import NutrientCard from '../components/NutrientCard';
import QualityScore from '../components/QualityScore';
import { theme } from '../constants/theme';
import { ProductInfo } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.8;
const BOTTOM_SHEET_MIN_HEIGHT = 120;

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
  const [scanningAnimation] = useState(new Animated.Value(0));
  
  const bottomSheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastGesture = useRef(0);

  const startScanning = () => {
    setIsScanning(true);
    
    // Animate scanning indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanningAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(scanningAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Simulate finding a product after random time
    const scanTime = Math.random() * 3000 + 2000; // 2-5 seconds
    setTimeout(() => {
      setScannedProduct(mockProductData);
      showBottomSheet();
      Animated.loop().stop();
      scanningAnimation.setValue(0);
    }, scanTime);
  };

  const showBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const expandBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const collapseBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const dismissBottomSheet = () => {
    Animated.timing(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setScannedProduct(null);
      setIsScanning(false);
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: bottomSheetTranslateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { state, translationY } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      lastGesture.current = translationY;
    }
    
    if (state === State.END) {
      const draggedDown = translationY > lastGesture.current + 50;
      const draggedUp = translationY < lastGesture.current - 50;
      
      if (draggedDown && translationY > SCREEN_HEIGHT * 0.3) {
        dismissBottomSheet();
      } else if (draggedUp) {
        expandBottomSheet();
      } else {
        collapseBottomSheet();
      }
    }
  };

  useEffect(() => {
    if (!isScanning && !scannedProduct) {
      startScanning();
    }
  }, []);

  const scanLinePosition = scanningAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 280],
  });

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons 
            name="camera" 
            size={80} 
            color={theme.colors.textSecondary} 
          />
          <Text style={styles.cameraText}>Camera View</Text>
          <Text style={styles.cameraSubtext}>
            Point camera at barcode to scan
          </Text>
          
          {/* Scanning overlay */}
          <View style={styles.scanningOverlay}>
            <View style={styles.scanFrame} />
            {isScanning && (
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { top: scanLinePosition }
                ]} 
              />
            )}
          </View>
        </View>
        
        <Text style={styles.instructionText}>
          {isScanning 
            ? "Scanning for barcodes..." 
            : "Tap anywhere to start scanning"
          }
        </Text>
        
        {!isScanning && !scannedProduct && (
          <View style={styles.buttonContainer}>
            <Button
              title="Start Scanning"
              onPress={startScanning}
              icon="scan"
            />
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      {scannedProduct && (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View 
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: bottomSheetTranslateY }],
              }
            ]}
          >
            {/* Handle */}
            <View style={styles.bottomSheetHandle} />
            
            {/* Quick info */}
            <View style={styles.quickInfo}>
              <View style={styles.productQuickInfo}>
                <Text style={styles.productNameQuick}>{scannedProduct.name}</Text>
                <Text style={styles.productBrandQuick}>{scannedProduct.brand}</Text>
              </View>
              <View style={styles.scoreQuick}>
                <Text style={styles.scoreValueQuick}>{scannedProduct.qualityScore}</Text>
                <Text style={styles.scoreMaxQuick}>/100</Text>
              </View>
            </View>

            {/* Detailed content */}
            <View style={styles.detailedContent}>
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

              {/* Health Warnings */}
              {scannedProduct.healthWarnings.length > 0 && (
                <View style={styles.warningsSection}>
                  <Text style={styles.sectionTitle}>Health Warnings</Text>
                  {scannedProduct.healthWarnings.map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <Ionicons 
                        name="warning" 
                        size={16} 
                        color={theme.colors.warning} 
                      />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Benefits */}
              {scannedProduct.benefits.length > 0 && (
                <View style={styles.benefitsSection}>
                  <Text style={styles.sectionTitle}>Health Benefits</Text>
                  {scannedProduct.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={theme.colors.success} 
                      />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionsContainer}>
                <Button
                  title="Scan Another"
                  onPress={() => {
                    dismissBottomSheet();
                  }}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="Save Product"
                  onPress={() => {
                    // TODO: Implement save functionality
                  }}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  cameraPlaceholder: {
    width: 300,
    height: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: theme.spacing.large,
    ...theme.shadows.medium,
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
  },
  cameraSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'transparent',
  },
  scanLine: {
    position: 'absolute',
    left: 25,
    right: 25,
    height: 2,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  instructionText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.medium,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    minHeight: BOTTOM_SHEET_MIN_HEIGHT,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
    ...theme.shadows.large,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.medium,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productQuickInfo: {
    flex: 1,
  },
  productNameQuick: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  productBrandQuick: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scoreQuick: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValueQuick: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  scoreMaxQuick: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  detailedContent: {
    padding: theme.spacing.large,
  },
  nutrientsSection: {
    marginTop: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },
  warningsSection: {
    marginTop: theme.spacing.large,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  benefitsSection: {
    marginTop: theme.spacing.large,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.extraLarge,
  },
  actionButton: {
    flex: 1,
  },
});