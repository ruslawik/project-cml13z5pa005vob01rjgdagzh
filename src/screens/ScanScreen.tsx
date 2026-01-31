import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../components/Button';
import NutrientCard from '../components/NutrientCard';
import QualityScore from '../components/QualityScore';
import { theme } from '../constants/theme';
import { ProductInfo, ScannedItem } from '../types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.8;
const BOTTOM_SHEET_MIN_HEIGHT = 120;
const STORAGE_KEY = '@scanned_items_history';

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
  },
  "4567890123456": {
    name: "Greek Yogurt",
    brand: "HealthyDairy",
    barcode: "4567890123456",
    qualityScore: 92,
    nutrients: {
      calories: { value: 100, unit: "kcal", per: "100g" },
      protein: { value: 10, unit: "g", per: "100g" },
      carbs: { value: 4, unit: "g", per: "100g" },
      fat: { value: 5, unit: "g", per: "100g" },
      fiber: { value: 0, unit: "g", per: "100g" },
      sugar: { value: 4, unit: "g", per: "100g" },
      sodium: { value: 65, unit: "mg", per: "100g" },
    },
    healthWarnings: [],
    benefits: [
      "High in protein",
      "Rich in probiotics",
      "Low in sugar",
      "Source of calcium"
    ]
  }
};

// Common barcodes for demo
const sampleBarcodes = Object.keys(mockProductDatabase);

interface ApiResponse {
  body?: ProductInfo;
  error?: string;
  success?: boolean;
}

export default function ScanScreen() {
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);
  const [scanningAnimation] = useState(new Animated.Value(0));
  const [error, setError] = useState<string | null>(null);
  const [scanningStatus, setScanningStatus] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  
  const bottomSheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scanningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const saveToHistory = async (product: ProductInfo) => {
    try {
      const existingItems = await AsyncStorage.getItem(STORAGE_KEY);
      let items: ScannedItem[] = existingItems ? JSON.parse(existingItems) : [];
      
      const newItem: ScannedItem = {
        id: Date.now().toString(),
        barcode: product.barcode,
        productName: product.name,
        brand: product.brand,
        timestamp: new Date(),
        qualityScore: product.qualityScore,
      };
      
      items.unshift(newItem);
      
      // Keep only last 50 items
      if (items.length > 50) {
        items = items.slice(0, 50);
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

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
      }, 1000);
    });
  };

  const handleBarcodeProcessing = async (barcode: string) => {
    setIsProcessing(true);
    setScanningStatus('Barcode detected! Processing...');
    setShowCamera(false);

    try {
      const response = await fetchProductData(barcode);
      const productData = handleApiResponse(response);
      
      if (productData) {
        setScannedProduct(productData);
        setScanningStatus('Product found!');
        await saveToHistory(productData);
        showBottomSheet();
      } else {
        Alert.alert(
          "Product Not Found", 
          `Barcode: ${barcode}\n\nProduct not found in our database. Try a different barcode.`,
          [{ text: "Try Again", onPress: resetScanning }]
        );
      }
    } catch (err) {
      setError("Network error occurred");
      Alert.alert("Error", "Failed to fetch product data. Please try again.", [
        { text: "Try Again", onPress: resetScanning }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (scannedBarcode === scanningResult.data) return; // Prevent multiple scans of same barcode
    
    setScannedBarcode(scanningResult.data);
    handleBarcodeProcessing(scanningResult.data);
  };

  const openCamera = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Camera access is required to scan barcodes.");
        return;
      }
    }

    setShowCamera(true);
    setScannedBarcode(null);
    setError(null);
    setScanningStatus('Point camera at barcode');
    startScanningAnimation();
  };

  const handleManualBarcode = () => {
    if (manualBarcode.trim()) {
      handleBarcodeProcessing(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const startScanningAnimation = () => {
    scanningAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanningAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanningAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    scanningAnimationRef.current.start();
  };

  const stopScanningAnimation = () => {
    if (scanningAnimationRef.current) {
      scanningAnimationRef.current.stop();
    }
  };

  const showBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.timing(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const resetScanning = () => {
    setScannedProduct(null);
    setError(null);
    setScanningStatus('');
    setShowCamera(false);
    setScannedBarcode(null);
    hideBottomSheet();
    stopScanningAnimation();
  };

  const scannerOverlayTop = scanningAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, SCREEN_HEIGHT * 0.6 - 100],
  });

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <Animated.View 
                style={[
                  styles.scanLine,
                  { top: scannerOverlayTop }
                ]} 
              />
            </View>
            <View style={styles.scanInstructions}>
              <Text style={styles.instructionText}>{scanningStatus}</Text>
              <View style={styles.cameraControls}>
                <TouchableOpacity onPress={resetScanning} style={styles.controlButton}>
                  <Ionicons name="close" size={24} color={theme.colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CameraView>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.text} />
            <Text style={styles.processingText}>{scanningStatus}</Text>
          </View>
        )}
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={80} color={theme.colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan barcodes for nutrient analysis
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scanOptions}>
        <View style={styles.headerSection}>
          <Ionicons name="scan" size={60} color={theme.colors.text} />
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <Text style={styles.headerSubtitle}>
            Scan or enter a barcode to get nutrient information
          </Text>
        </View>

        <View style={styles.scanMethods}>
          <Button
            title="Open Camera"
            onPress={openCamera}
            icon="camera"
            style={styles.cameraButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualInput}>
            <TextInput
              style={styles.barcodeInput}
              placeholder="Enter barcode manually"
              placeholderTextColor={theme.colors.textMuted}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
            />
            <Button
              title="Scan"
              onPress={handleManualBarcode}
              style={styles.manualButton}
              disabled={!manualBarcode.trim()}
            />
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Try Demo Barcodes:</Text>
            {sampleBarcodes.map((barcode) => (
              <TouchableOpacity
                key={barcode}
                style={styles.demoBarcode}
                onPress={() => {
                  setManualBarcode(barcode);
                  handleBarcodeProcessing(barcode);
                }}
              >
                <Text style={styles.demoBarcodeText}>{barcode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: bottomSheetTranslateY }] }
        ]}
      >
        <View style={styles.bottomSheetHeader}>
          <View style={styles.handle} />
          <TouchableOpacity onPress={resetScanning} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {scannedProduct && (
          <ScrollView style={styles.productDetails} showsVerticalScrollIndicator={false}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{scannedProduct.name}</Text>
              <Text style={styles.brandName}>{scannedProduct.brand}</Text>
              <Text style={styles.barcode}>Barcode: {scannedProduct.barcode}</Text>
            </View>

            <QualityScore score={scannedProduct.qualityScore} />

            <View style={styles.nutrientSection}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutrientGrid}>
                {Object.entries(scannedProduct.nutrients).map(([key, nutrient]) => (
                  <NutrientCard
                    key={key}
                    name={key}
                    value={nutrient.value}
                    unit={nutrient.unit}
                    per={nutrient.per}
                  />
                ))}
              </View>
            </View>

            {scannedProduct.benefits && scannedProduct.benefits.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.text} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}

            {scannedProduct.healthWarnings && scannedProduct.healthWarnings.length > 0 && (
              <View style={styles.warningsSection}>
                <Text style={styles.sectionTitle}>Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="warning" size={20} color={theme.colors.text} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50,
    borderWidth: 2,
    borderColor: theme.colors.background,
    borderRadius: 20,
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.background,
  },
  scanInstructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    minWidth: 200,
  },
  scanOptions: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scanMethods: {
    flex: 1,
  },
  cameraButton: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  manualInput: {
    marginBottom: 40,
  },
  barcodeInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  manualButton: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: 24,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  demoBarcode: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoBarcodeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_MAX_HEIGHT,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  closeButton: {
    padding: 8,
  },
  productDetails: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  barcode: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  nutrientSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitsSection: {
    marginTop: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  warningsSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  warningText: {
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
});