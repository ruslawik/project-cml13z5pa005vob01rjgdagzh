import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, PanResponder, Alert, TouchableOpacity, Platform } from 'react-native';
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
    return (
      <View style={styles.cameraFallback}>
        <Ionicons name="camera-outline" size={80} color="#666" />
        <Text style={styles.fallbackText}>
          Demo Mode - Barcode Scanner
        </Text>
        <Text style={styles.fallbackSubtext}>
          Tap "Demo Scan" to simulate scanning
        </Text>
      </View>
    );
  };

  useEffect(() => {
    return () => {
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {renderCamera()}
        
        {/* Camera Overlay */}
        <View style={styles.overlay}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.instructionText}>
              {isScanning ? scanningStatus : "Position barcode within the frame"}
            </Text>
          </View>
          
          {/* Scanning Frame */}
          <View style={styles.scanningFrame}>
            <View style={styles.scanningArea}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning line animation */}
              {isScanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanningAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 180],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          </View>
          
          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {!isScanning ? (
              <Button
                title="Demo Scan"
                onPress={startScanning}
                style={styles.scanButton}
              />
            ) : (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (scanningAnimationRef.current) {
                    scanningAnimationRef.current.stop();
                    scanningAnimationRef.current = null;
                  }
                  scanningAnimation.setValue(0);
                  setIsScanning(false);
                  setScanningStatus('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
        <View style={styles.bottomSheetHeader}>
          <View style={styles.dragHandle} />
        </View>
        
        {scannedProduct && (
          <View style={styles.bottomSheetContent}>
            {/* Collapsed View */}
            <View style={styles.collapsedContent}>
              <View style={styles.productHeader}>
                <View style={styles.productTitleSection}>
                  <Text style={styles.productName}>{scannedProduct.name}</Text>
                  <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
                </View>
                <QualityScore score={scannedProduct.qualityScore} />
              </View>
            </View>
            
            {/* Expanded Content */}
            <View style={styles.expandedContent}>
              <Text style={styles.sectionTitle}>Nutritional Information</Text>
              <View style={styles.nutrientsGrid}>
                <NutrientCard
                  label="Calories"
                  value={scannedProduct.nutrients.calories.value}
                  unit={scannedProduct.nutrients.calories.unit}
                />
                <NutrientCard
                  label="Protein"
                  value={scannedProduct.nutrients.protein.value}
                  unit={scannedProduct.nutrients.protein.unit}
                />
                <NutrientCard
                  label="Carbs"
                  value={scannedProduct.nutrients.carbs.value}
                  unit={scannedProduct.nutrients.carbs.unit}
                />
                <NutrientCard
                  label="Fat"
                  value={scannedProduct.nutrients.fat.value}
                  unit={scannedProduct.nutrients.fat.unit}
                />
                <NutrientCard
                  label="Fiber"
                  value={scannedProduct.nutrients.fiber.value}
                  unit={scannedProduct.nutrients.fiber.unit}
                />
                <NutrientCard
                  label="Sugar"
                  value={scannedProduct.nutrients.sugar.value}
                  unit={scannedProduct.nutrients.sugar.unit}
                />
              </View>
              
              {scannedProduct.healthWarnings.length > 0 && (
                <View style={styles.warningsSection}>
                  <Text style={styles.sectionTitle}>Health Warnings</Text>
                  {scannedProduct.healthWarnings.map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <Ionicons name="warning" size={16} color="#ff6b6b" />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {scannedProduct.benefits.length > 0 && (
                <View style={styles.benefitsSection}>
                  <Text style={styles.sectionTitle}>Benefits</Text>
                  {scannedProduct.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4ecdc4" />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Button
                title="Scan Another Product"
                onPress={dismissBottomSheet}
                style={styles.scanAnotherButton}
              />
            </View>
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  fallbackText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  topSection: {
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    fontWeight: '500',
  },
  scanningFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningArea: {
    width: 250,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bottomSection: {
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: BOTTOM_SHEET_MIN_HEIGHT,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  collapsedContent: {
    paddingVertical: 15,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitleSection: {
    flex: 1,
    paddingRight: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
  },
  expandedContent: {
    flex: 1,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  warningsSection: {
    marginTop: 15,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  warningText: {
    marginLeft: 8,
    color: '#ff6b6b',
    fontSize: 14,
  },
  benefitsSection: {
    marginTop: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  benefitText: {
    marginLeft: 8,
    color: '#4ecdc4',
    fontSize: 14,
  },
  scanAnotherButton: {
    marginTop: 25,
    backgroundColor: theme.colors.secondary,
  },
});