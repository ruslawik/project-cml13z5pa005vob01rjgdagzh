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

// Simulate scanning different barcodes
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
      // Simulate the scanning process with status updates
      setScanningStatus('Initializing camera...');
      
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
    setScanningStatus('Starting scan...');
    
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

  useEffect(() => {
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
      {/* Enhanced Camera Simulation */}
      <TouchableOpacity 
        style={styles.cameraContainer}
        onPress={!isScanning && !scannedProduct ? startScanning : undefined}
        activeOpacity={0.8}
      >
        <View style={styles.cameraPlaceholder}>
          {!isScanning && !scannedProduct && (
            <>
              <Ionicons 
                name="camera" 
                size={80} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.cameraText}>Camera Simulation for Expo Snack</Text>
              <Text style={styles.cameraSubtext}>
                Tap to start realistic barcode scanning simulation
              </Text>
              <Text style={styles.noteText}>
                📱 For real camera: download the Expo Go app and run on device
              </Text>
            </>
          )}
          
          {/* Enhanced scanning overlay with status */}
          <View style={styles.scanningOverlay}>
            <View style={styles.scanFrame} />
            
            {/* Corner guides */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {isScanning && (
              <>
                <Animated.View 
                  style={[
                    styles.scanLine, 
                    { top: scanLinePosition }
                  ]} 
                />
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>{scanningStatus}</Text>
                  <View style={styles.loadingDots}>
                    <Animated.View style={[styles.dot, { opacity: scanningAnimation }]} />
                    <Animated.View style={[styles.dot, { opacity: scanningAnimation }]} />
                    <Animated.View style={[styles.dot, { opacity: scanningAnimation }]} />
                  </View>
                </View>
              </>
            )}
          </View>

          {isScanning && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>
                🎯 Hold steady and center the barcode
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {!isScanning && !scannedProduct && (
        <View style={styles.actionsContainer}>
          <Button
            title="Start Scanning"
            onPress={startScanning}
            variant="primary"
            icon="scan"
          />
          
          <Text style={styles.infoText}>
            💡 This is a realistic simulation optimized for Expo Snack. 
            For actual camera scanning, you need to download Expo Go app on a real device.
          </Text>
        </View>
      )}

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: bottomSheetTranslateY }] }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHeader}>
          <View style={styles.handle} />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={dismissBottomSheet}
          >
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {scannedProduct && (
          <View style={styles.bottomSheetContent}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{scannedProduct.name}</Text>
              <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
              <Text style={styles.barcodeText}>Barcode: {scannedProduct.barcode}</Text>
            </View>

            <QualityScore score={scannedProduct.qualityScore} />
            
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <View style={styles.nutrientsGrid}>
              {Object.entries(scannedProduct.nutrients).map(([key, nutrient]) => (
                <NutrientCard
                  key={key}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={nutrient.value}
                  unit={nutrient.unit}
                  per={nutrient.per}
                />
              ))}
            </View>

            {scannedProduct.healthWarnings.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.warningTitle]}>⚠️ Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </>
            )}

            {scannedProduct.benefits.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.benefitTitle]}>✅ Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <Text key={index} style={styles.benefitText}>• {benefit}</Text>
                ))}
              </>
            )}

            <View style={styles.bottomSheetActions}>
              <Button
                title="Scan Another"
                onPress={dismissBottomSheet}
                variant="outline"
                style={styles.actionButton}
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
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraText: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  cameraSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  noteText: {
    color: theme.colors.primary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  scanningOverlay: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 300,
  },
  scanFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusContainer: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 12,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: BOTTOM_SHEET_MIN_HEIGHT,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    position: 'relative',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  productHeader: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  warningTitle: {
    color: theme.colors.error,
  },
  benefitTitle: {
    color: theme.colors.success,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  warningText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  benefitText: {
    color: theme.colors.success,
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  bottomSheetActions: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    marginHorizontal: 0,
  },
});
