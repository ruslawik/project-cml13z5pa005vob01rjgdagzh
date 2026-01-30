import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, PanResponder, Alert, TouchableOpacity, Platform } from 'react-native';
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
  const [isWebPlatform, setIsWebPlatform] = useState(false);
  
  const bottomSheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scanningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    setIsWebPlatform(Platform.OS === 'web');
  }, []);

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

  useEffect(() => {
    return () => {
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
        scanningAnimationRef.current = null;
      }
    };
  }, []);

  const renderCameraView = () => {
    return (
      <View style={styles.cameraPlaceholder}>
        <View style={styles.demoInfo}>
          <Ionicons name="camera" size={64} color={theme.colors.primary} />
          <Text style={styles.demoText}>Demo Mode</Text>
          <Text style={styles.demoSubtext}>
            {isWebPlatform 
              ? 'Camera scanning simulated for Expo Snack demo'
              : 'Barcode scanning demo - in production, this would use real camera'}
          </Text>
        </View>
      </View>
    );
  };

  const scanLinePosition = scanningAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, SCREEN_HEIGHT * 0.6 - 150],
  });

  return (
    <View style={styles.container}>
      {renderCameraView()}

      {/* Scanning overlay */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={styles.overlayTop} />
        
        {/* Middle section with scanning frame */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlayLeft} />
          <View style={styles.scanningFrame}>
            <View style={styles.frameCorner} />
            <View style={[styles.frameCorner, styles.topRight]} />
            <View style={[styles.frameCorner, styles.bottomLeft]} />
            <View style={[styles.frameCorner, styles.bottomRight]} />
            
            {isScanning && (
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { transform: [{ translateY: scanLinePosition }] }
                ]} 
              />
            )}
          </View>
          <View style={styles.overlayRight} />
        </View>
        
        {/* Bottom overlay */}
        <View style={styles.overlayBottom} />
      </View>

      {/* Status and controls */}
      <View style={styles.statusContainer}>
        {scanningStatus !== '' && (
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusText}>{scanningStatus}</Text>
          </View>
        )}

        {!isScanning && (
          <Button
            title="Start Demo Scan"
            onPress={startScanning}
            style={styles.scanButton}
          />
        )}

        {isScanning && (
          <Button
            title="Cancel"
            onPress={() => {
              if (scanningAnimationRef.current) {
                scanningAnimationRef.current.stop();
                scanningAnimationRef.current = null;
              }
              setIsScanning(false);
              setScanningStatus('');
              scanningAnimation.setValue(0);
            }}
            variant="secondary"
            style={styles.cancelButton}
          />
        )}
      </View>

      {/* Bottom sheet for scanned product */}
      {scannedProduct && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: bottomSheetTranslateY }] }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.bottomSheetHandle} />
          
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{scannedProduct.name}</Text>
              <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
            </View>
            <QualityScore score={scannedProduct.qualityScore} size="small" />
            <TouchableOpacity onPress={dismissBottomSheet} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.nutrientGrid}>
            {Object.entries(scannedProduct.nutrients).map(([key, nutrient]) => (
              <NutrientCard
                key={key}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                value={`${nutrient.value}${nutrient.unit}`}
                subtitle={`per ${nutrient.per}`}
              />
            ))}
          </View>

          {scannedProduct.healthWarnings.length > 0 && (
            <View style={styles.warningsSection}>
              <Text style={styles.sectionTitle}>⚠️ Health Warnings</Text>
              {scannedProduct.healthWarnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>• {warning}</Text>
              ))}
            </View>
          )}

          {scannedProduct.benefits.length > 0 && (
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>✅ Benefits</Text>
              {scannedProduct.benefits.map((benefit, index) => (
                <Text key={index} style={styles.benefitText}>• {benefit}</Text>
              ))}
            </View>
          )}
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
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoInfo: {
    alignItems: 'center',
    padding: 30,
  },
  demoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  demoSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    height: 300,
    flexDirection: 'row',
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanningFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 10,
    right: 10,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statusTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  scanButton: {
    minWidth: 200,
  },
  cancelButton: {
    minWidth: 200,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  warningsSection: {
    marginBottom: 16,
  },
  benefitsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.error,
    lineHeight: 20,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.success,
    lineHeight: 20,
    marginBottom: 4,
  },
});