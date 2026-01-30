import React, { useState, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, PanResponder, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import NutrientCard from '../components/NutrientCard';
import QualityScore from '../components/QualityScore';
import { theme } from '../constants/theme';
import { ProductInfo } from '../types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.8;
const BOTTOM_SHEET_MIN_HEIGHT = 120;

// Mock data for demo purposes - simulates real barcode scanning results
const mockProductDatabase: { [key: string]: ProductInfo } = {
  "1234567890123": {
    name: "Organic Oats Cereal",
    brand: "HealthyBrand",
    barcode: "1234567890123",
    qualityScore: 85,
    nutrients: {
      calories: { value: 150, unit: "kcal", per: "100g" },
      protein: { value: 8.5, unit: "g", per: "100g" },
      carbs: { value: 60, unit: "g", per: "100g" },
      fat: { value: 2.1, unit: "g", per: "100g" },
      fiber: { value: 5.2, unit: "g", per: "100g" },
      sugar: { value: 8, unit: "g", per: "100g" },
      sodium: { value: 120, unit: "mg", per: "100g" },
    },
    healthWarnings: [
      "Contains gluten traces"
    ],
    benefits: [
      "High in fiber",
      "Organic ingredients",
      "Low sugar content",
      "Fortified with vitamins"
    ]
  },
  "9876543210987": {
    name: "Chocolate Cookies",
    brand: "SweetTooth",
    barcode: "9876543210987",
    qualityScore: 45,
    nutrients: {
      calories: { value: 480, unit: "kcal", per: "100g" },
      protein: { value: 6.2, unit: "g", per: "100g" },
      carbs: { value: 65, unit: "g", per: "100g" },
      fat: { value: 22, unit: "g", per: "100g" },
      fiber: { value: 3.1, unit: "g", per: "100g" },
      sugar: { value: 28, unit: "g", per: "100g" },
      sodium: { value: 320, unit: "mg", per: "100g" },
    },
    healthWarnings: [
      "High in sugar",
      "High in saturated fat",
      "Contains palm oil",
      "High sodium content"
    ],
    benefits: [
      "Source of energy"
    ]
  }
};

// Simulate scanning different barcodes for web/unsupported platforms
const getRandomBarcode = (): string => {
  const barcodes = Object.keys(mockProductDatabase);
  return barcodes[Math.floor(Math.random() * barcodes.length)];
};

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
  const [scanningStatus, setScanningStatus] = useState<string>('');
  
  const bottomSheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scanningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const handleApiResponse = (response: ApiResponse | null | undefined): ProductInfo | null => {
    if (!response) {
      setError("No response received from server");
      return null;
    }

    if (!response.body) {
      setError(response.error || "No product data found");
      return null;
    }

    setError(null);
    return response.body;
  };

  const fetchProductData = async (barcode: string): Promise<ApiResponse> => {
    return new Promise((resolve) => {
      setScanningStatus('Processing barcode...');
      
      setTimeout(() => {
        setScanningStatus('Fetching product data...');
        
        // Check if barcode exists in mock database
        const productData = mockProductDatabase[barcode];
        
        if (productData) {
          resolve({ body: productData, success: true });
        } else {
          // For unknown barcodes, return a generic product
          const genericProduct: ProductInfo = {
            name: "Unknown Product",
            brand: "Unknown Brand",
            barcode: barcode,
            qualityScore: 60,
            nutrients: {
              calories: { value: 200, unit: "kcal", per: "100g" },
              protein: { value: 5, unit: "g", per: "100g" },
              carbs: { value: 40, unit: "g", per: "100g" },
              fat: { value: 10, unit: "g", per: "100g" },
              fiber: { value: 3, unit: "g", per: "100g" },
              sugar: { value: 15, unit: "g", per: "100g" },
              sodium: { value: 200, unit: "mg", per: "100g" },
            },
            healthWarnings: ["Product information limited"],
            benefits: ["Scanned successfully"]
          };
          resolve({ body: genericProduct, success: true });
        }
      }, 1500);
    });
  };

  const simulateRealScanning = (): Promise<ApiResponse> => {
    return new Promise((resolve) => {
      // Simulate the real camera scanning process
      setScanningStatus('Simulating barcode scan...');
      
      setTimeout(() => {
        setScanningStatus('Looking for barcode...');
      }, 800);
      
      setTimeout(() => {
        setScanningStatus('Barcode detected! Processing...');
      }, 1800);
      
      setTimeout(() => {
        setScanningStatus('Fetching product data...');
        
        // Simulate successful scan with random product
        const randomBarcode = getRandomBarcode();
        const productData = mockProductDatabase[randomBarcode];
        
        if (Math.random() > 0.1) { // 90% success rate
          resolve({ body: productData, success: true });
        } else {
          resolve({ error: "Product not found in database", success: false });
        }
      }, 3000);
    });
  };

  const startScanning = async () => {
    // Demo mode for Expo Snack compatibility
    setIsScanning(true);
    setError(null);
    setScanningStatus('Starting demo scan...');
    
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
      const response = await simulateRealScanning();
      const productData = handleApiResponse(response);
      
      if (productData) {
        setScannedProduct(productData);
        setScanningStatus('Product found!');
        showBottomSheet();
      } else {
        Alert.alert(
          "Scan Failed", 
          error || "Could not find product information. Try scanning a different barcode.",
          [{ text: "Try Again", onPress: () => setIsScanning(false) }]
        );
        setIsScanning(false);
        setScanningStatus('');
      }
    } catch (err) {
      setError("Network error occurred");
      Alert.alert("Error", "Failed to scan product. Please try again.");
      setIsScanning(false);
      setScanningStatus('');
    } finally {
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
      setScanningStatus('');
    });
  };

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

  const renderCamera = () => {
    // Demo mode interface for Expo Snack compatibility
    return (
      <View style={styles.cameraFallback}>
        <Ionicons name="camera" size={80} color={theme.colors.primary} />
        <Text style={styles.cameraFallbackText}>
          Demo Mode - Simulated Barcode Scanner
        </Text>
        <Text style={styles.demoInstructions}>
          Click "Demo Scan" to simulate scanning a product barcode
        </Text>
        {isScanning && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanningAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 200],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
        {scanningStatus && (
          <Text style={styles.scanningText}>{scanningStatus}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderCamera()}

      {/* Camera controls */}
      <View style={styles.controlsContainer}>
        {!isScanning && !scannedProduct && (
          <Button
            title="Demo Scan"
            onPress={startScanning}
            style={styles.scanButton}
          />
        )}
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: bottomSheetTranslateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHandle} />
        
        {scannedProduct && (
          <View style={styles.productContainer}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{scannedProduct.name}</Text>
                <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
                <Text style={styles.barcodeText}>Barcode: {scannedProduct.barcode}</Text>
              </View>
              <QualityScore score={scannedProduct.qualityScore} />
            </View>

            <View style={styles.nutrientsContainer}>
              <Text style={styles.sectionTitle}>Nutritional Information</Text>
              <View style={styles.nutrientsGrid}>
                <NutrientCard
                  name="Calories"
                  value={scannedProduct.nutrients.calories.value}
                  unit={scannedProduct.nutrients.calories.unit}
                  per={scannedProduct.nutrients.calories.per}
                />
                <NutrientCard
                  name="Protein"
                  value={scannedProduct.nutrients.protein.value}
                  unit={scannedProduct.nutrients.protein.unit}
                  per={scannedProduct.nutrients.protein.per}
                />
                <NutrientCard
                  name="Carbs"
                  value={scannedProduct.nutrients.carbs.value}
                  unit={scannedProduct.nutrients.carbs.unit}
                  per={scannedProduct.nutrients.carbs.per}
                />
                <NutrientCard
                  name="Fat"
                  value={scannedProduct.nutrients.fat.value}
                  unit={scannedProduct.nutrients.fat.unit}
                  per={scannedProduct.nutrients.fat.per}
                />
                <NutrientCard
                  name="Fiber"
                  value={scannedProduct.nutrients.fiber.value}
                  unit={scannedProduct.nutrients.fiber.unit}
                  per={scannedProduct.nutrients.fiber.per}
                />
                <NutrientCard
                  name="Sugar"
                  value={scannedProduct.nutrients.sugar.value}
                  unit={scannedProduct.nutrients.sugar.unit}
                  per={scannedProduct.nutrients.sugar.per}
                />
              </View>
            </View>

            {scannedProduct.healthWarnings.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={styles.sectionTitle}>Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="warning" size={16} color={theme.colors.error} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            {scannedProduct.benefits.length > 0 && (
              <View style={styles.benefitsContainer}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={dismissBottomSheet}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  cameraFallbackText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    fontWeight: 'bold',
  },
  demoInstructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
    fontStyle: 'italic',
  },
  scanLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    backgroundColor: theme.colors.primary,
    top: '40%',
  },
  scanningText: {
    color: theme.colors.primary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 200,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  productContainer: {
    flex: 1,
    paddingBottom: 40,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productInfo: {
    flex: 1,
    marginRight: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  barcodeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  nutrientsContainer: {
    marginBottom: 25,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  warningsContainer: {
    marginBottom: 25,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 8,
    flex: 1,
  },
  benefitsContainer: {
    marginBottom: 25,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.success,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});