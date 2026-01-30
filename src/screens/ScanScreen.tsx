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

// Type for API response to handle potential undefined response
interface ApiResponse {
  body?: ProductInfo;
  error?: string;
  success?: boolean;
}

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);
  const [scanningAnimation] = useState(new Animated.Value(0));
  const [error, setError] = useState<string | null>(null);
  
  const bottomSheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scanningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const handleApiResponse = (response: ApiResponse | null | undefined): ProductInfo | null => {
    // Handle undefined/null response
    if (!response) {
      setError("No response received from server");
      return null;
    }

    // Handle response without body property
    if (!response.body) {
      setError(response.error || "No product data found");
      return null;
    }

    // Handle successful response with body
    setError(null);
    return response.body;
  };

  const simulateApiCall = (): Promise<ApiResponse> => {
    return new Promise((resolve) => {
      // Simulate various API response scenarios
      setTimeout(() => {
        const scenarios = [
          // Successful response
          { body: mockProductData, success: true },
          // Response without body (simulating the error case)
          { error: "Product not found", success: false },
          // Null response
          null,
        ];
        
        // Mostly return successful responses for demo
        const randomScenario = Math.random() < 0.8 ? scenarios[0] : scenarios[1];
        resolve(randomScenario as ApiResponse);
      }, 2000);
    });
  };

  const startScanning = async () => {
    setIsScanning(true);
    setError(null);
    
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

    try {
      // Simulate API call with potential undefined response
      const response = await simulateApiCall();
      const productData = handleApiResponse(response);
      
      if (productData) {
        setScannedProduct(productData);
        showBottomSheet();
      } else {
        // Handle case where no product data is returned
        Alert.alert(
          "Scan Failed", 
          error || "Could not find product information",
          [{ text: "Try Again", onPress: () => setIsScanning(false) }]
        );
        setIsScanning(false);
      }
    } catch (err) {
      setError("Network error occurred");
      Alert.alert("Error", "Failed to scan product. Please try again.");
      setIsScanning(false);
    } finally {
      // Stop the animation safely with null check
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
        scanningAnimationRef.current = null;
      }
      scanningAnimation.setValue(0);
    }
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
      setError(null);
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
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
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
              <Text style={styles.productNameQuick}>{scannedProduct?.name || 'Unknown Product'}</Text>
              <Text style={styles.productBrandQuick}>{scannedProduct?.brand || 'Unknown Brand'}</Text>
            </View>
            <View style={styles.scoreQuick}>
              <Text style={styles.scoreValueQuick}>{scannedProduct?.qualityScore || 0}</Text>
              <Text style={styles.scoreMaxQuick}>/100</Text>
            </View>
          </View>

          {/* Detailed content */}
          <View style={styles.detailedContent}>
            <QualityScore score={scannedProduct?.qualityScore || 0} />

            <View style={styles.nutrientsSection}>
              <Text style={styles.sectionTitle}>Nutrients (per 100g)</Text>
              <View style={styles.nutrientsGrid}>
                <NutrientCard
                  name="Calories"
                  value={scannedProduct?.nutrients?.calories?.value || 0}
                  unit={scannedProduct?.nutrients?.calories?.unit || 'kcal'}
                />
                <NutrientCard
                  name="Protein"
                  value={scannedProduct?.nutrients?.protein?.value || 0}
                  unit={scannedProduct?.nutrients?.protein?.unit || 'g'}
                />
                <NutrientCard
                  name="Carbs"
                  value={scannedProduct?.nutrients?.carbs?.value || 0}
                  unit={scannedProduct?.nutrients?.carbs?.unit || 'g'}
                />
                <NutrientCard
                  name="Fat"
                  value={scannedProduct?.nutrients?.fat?.value || 0}
                  unit={scannedProduct?.nutrients?.fat?.unit || 'g'}
                />
                <NutrientCard
                  name="Fiber"
                  value={scannedProduct?.nutrients?.fiber?.value || 0}
                  unit={scannedProduct?.nutrients?.fiber?.unit || 'g'}
                />
                <NutrientCard
                  name="Sugar"
                  value={scannedProduct?.nutrients?.sugar?.value || 0}
                  unit={scannedProduct?.nutrients?.sugar?.unit || 'g'}
                />
              </View>
            </View>

            {scannedProduct?.healthWarnings && scannedProduct.healthWarnings.length > 0 && (
              <View style={styles.warningsSection}>
                <Text style={styles.sectionTitle}>⚠️ Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Text style={styles.warningText}>• {warning}</Text>
                  </View>
                ))}
              </View>
            )}

            {scannedProduct?.benefits && scannedProduct.benefits.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>✓ Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={styles.benefitText}>• {benefit}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <Button
                title="Scan Another"
                onPress={dismissBottomSheet}
                variant="outline"
                icon="scan"
              />
            </View>
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
    padding: theme.spacing.lg,
  },
  cameraPlaceholder: {
    width: 300,
    height: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  cameraText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  cameraSubtext: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    position: 'absolute',
  },
  scanLine: {
    position: 'absolute',
    left: 50,
    right: 50,
    height: 2,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    height: SCREEN_HEIGHT,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productQuickInfo: {
    flex: 1,
  },
  productNameQuick: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  productBrandQuick: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  scoreQuick: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  scoreValueQuick: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreMaxQuick: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  detailedContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: 100,
  },
  nutrientsSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.subheading.fontSize,
    fontWeight: theme.typography.subheading.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  warningsSection: {
    marginTop: theme.spacing.lg,
  },
  warningItem: {
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.typography.body.fontSize,
    color: '#D32F2F',
    lineHeight: 20,
  },
  benefitsSection: {
    marginTop: theme.spacing.lg,
  },
  benefitItem: {
    marginBottom: theme.spacing.xs,
  },
  benefitText: {
    fontSize: theme.typography.body.fontSize,
    color: '#388E3C',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
});