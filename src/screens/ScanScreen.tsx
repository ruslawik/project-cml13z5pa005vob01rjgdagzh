import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, PanResponder, Alert, TouchableOpacity } from 'react-native';
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
  const scanningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startScanning = () => {
    setIsScanning(true);
    
    // Create and store the animation reference
    const loopAnimation = Animated.loop(
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
    );
    
    scanningAnimationRef.current = loopAnimation;
    loopAnimation.start();

    // Simulate finding a product after random time
    const scanTime = Math.random() * 3000 + 2000; // 2-5 seconds
    setTimeout(() => {
      setScannedProduct(mockProductData);
      showBottomSheet();
      
      // Stop the animation safely with null check
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
        scanningAnimationRef.current = null;
      }
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

  // Replace PanGestureHandler with PanResponder for better web compatibility
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: (evt, gestureState) => {
      // Start gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      const newValue = (SCREEN_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT) + gestureState.dy;
      bottomSheetTranslateY.setValue(Math.max(
        SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
        Math.min(SCREEN_HEIGHT, newValue)
      ));
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dy, vy } = gestureState;
      
      if (dy > 100 || vy > 0.5) {
        if (dy > SCREEN_HEIGHT * 0.3) {
          dismissBottomSheet();
        } else {
          collapseBottomSheet();
        }
      } else if (dy < -100 || vy < -0.5) {
        expandBottomSheet();
      } else {
        collapseBottomSheet();
      }
    },
  });

  useEffect(() => {
    // Cleanup function to stop animation on unmount
    return () => {
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
        scanningAnimationRef.current = null;
      }
    };
  }, []);

  const scanLinePosition = scanningAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 280],
  });

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <TouchableOpacity 
        style={styles.cameraContainer}
        onPress={!isScanning && !scannedProduct ? startScanning : undefined}
        activeOpacity={0.8}
      >
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
      </TouchableOpacity>

      {/* Bottom Sheet */}
      {scannedProduct && (
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: bottomSheetTranslateY }],
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={styles.bottomSheetHandle} />
          
          {/* Quick info */}
          <View style={styles.quickInfo}>
            <View style={styles.productQuickInfo}>
              <Text style={styles.productNameQuick}>{scannedProduct.name || 'Unknown Product'}</Text>
              <Text style={styles.productBrandQuick}>{scannedProduct.brand || 'Unknown Brand'}</Text>
            </View>
            <View style={styles.scoreQuick}>
              <Text style={styles.scoreValueQuick}>{scannedProduct.qualityScore || 0}</Text>
              <Text style={styles.scoreMaxQuick}>/100</Text>
            </View>
          </View>

          {/* Detailed content */}
          <View style={styles.detailedContent}>
            <QualityScore score={scannedProduct.qualityScore || 0} />

            <View style={styles.nutrientsSection}>
              <Text style={styles.sectionTitle}>Nutrients (per 100g)</Text>
              <View style={styles.nutrientsGrid}>
                <NutrientCard
                  name="Calories"
                  value={scannedProduct.nutrients?.calories?.value || 0}
                  unit={scannedProduct.nutrients?.calories?.unit || 'kcal'}
                />
                <NutrientCard
                  name="Protein"
                  value={scannedProduct.nutrients?.protein?.value || 0}
                  unit={scannedProduct.nutrients?.protein?.unit || 'g'}
                />
                <NutrientCard
                  name="Carbs"
                  value={scannedProduct.nutrients?.carbs?.value || 0}
                  unit={scannedProduct.nutrients?.carbs?.unit || 'g'}
                />
                <NutrientCard
                  name="Fat"
                  value={scannedProduct.nutrients?.fat?.value || 0}
                  unit={scannedProduct.nutrients?.fat?.unit || 'g'}
                />
                <NutrientCard
                  name="Fiber"
                  value={scannedProduct.nutrients?.fiber?.value || 0}
                  unit={scannedProduct.nutrients?.fiber?.unit || 'g'}
                />
                <NutrientCard
                  name="Sugar"
                  value={scannedProduct.nutrients?.sugar?.value || 0}
                  unit={scannedProduct.nutrients?.sugar?.unit || 'g'}
                />
                <NutrientCard
                  name="Sodium"
                  value={scannedProduct.nutrients?.sodium?.value || 0}
                  unit={scannedProduct.nutrients?.sodium?.unit || 'mg'}
                />
              </View>
            </View>

            {/* Health Warnings */}
            {scannedProduct.healthWarnings && scannedProduct.healthWarnings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="warning" size={16} color={theme.colors.error} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Benefits */}
            {scannedProduct.benefits && scannedProduct.benefits.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
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
    padding: 20,
  },
  cameraPlaceholder: {
    width: 320,
    height: 320,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    position: 'relative',
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  cameraSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },
  scanFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  instructionText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    width: 200,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productQuickInfo: {
    flex: 1,
  },
  productNameQuick: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  scoreMaxQuick: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  detailedContent: {
    padding: 20,
    paddingBottom: 40,
  },
  nutrientsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    marginTop: 24,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
});