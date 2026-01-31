import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

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
      await requestPermission();
      return;
    }

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Camera access is needed to scan barcodes. Please grant permission in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Grant Permission", onPress: requestPermission }
        ]
      );
      return;
    }

    setShowCamera(true);
    setScannedBarcode(null);
    setScanningStatus('Point camera at barcode');
  };

  const resetScanning = () => {
    setScannedProduct(null);
    setError(null);
    setScanningStatus('');
    setManualBarcode('');
    setIsProcessing(false);
    setShowCamera(false);
    setScannedBarcode(null);
    hideBottomSheet();
  };

  const handleManualScan = () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a valid barcode');
      return;
    }
    handleBarcodeProcessing(manualBarcode.trim());
  };

  const handleSampleScan = (barcode: string) => {
    setManualBarcode(barcode);
    handleBarcodeProcessing(barcode);
  };

  const showBottomSheet = () => {
    Animated.timing(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
      duration: 300,
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

  useEffect(() => {
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

    if (showCamera) {
      startScanningAnimation();
    }

    return () => {
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
      }
    };
  }, [showCamera, scanningAnimation]);

  // Camera permission loading state
  if (permission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.permissionText}>Loading camera permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {showCamera && permission?.granted ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "code93", "codabar", "qr"],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          >
            {/* Scanning overlay */}
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame}>
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanningAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                        })
                      }]
                    }
                  ]}
                />
              </View>
            </View>
            
            {/* Status text */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{scanningStatus}</Text>
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </CameraView>
        </View>
      ) : (
        /* Main content when camera is not active */
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="scan-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Scan Product Barcode</Text>
            <Text style={styles.subtitle}>
              Point your camera at a product barcode to get nutritional information
            </Text>
          </View>

          {/* Camera button */}
          <Button
            title="Open Camera"
            onPress={openCamera}
            style={styles.cameraButton}
            icon="camera"
          />

          {/* Manual entry section */}
          <View style={styles.manualSection}>
            <Text style={styles.sectionTitle}>Or enter barcode manually:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter barcode number"
                value={manualBarcode}
                onChangeText={setManualBarcode}
                keyboardType="numeric"
                maxLength={13}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleManualScan}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="search" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sample barcodes */}
          <View style={styles.samplesSection}>
            <Text style={styles.sectionTitle}>Try these sample barcodes:</Text>
            <View style={styles.sampleButtons}>
              {sampleBarcodes.map((barcode) => (
                <TouchableOpacity
                  key={barcode}
                  style={styles.sampleButton}
                  onPress={() => handleSampleScan(barcode)}
                  disabled={isProcessing}
                >
                  <Text style={styles.sampleButtonText}>{barcode}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.processingText}>{scanningStatus}</Text>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom sheet for product details */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: bottomSheetTranslateY }],
          },
        ]}
      >
        {scannedProduct && (
          <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
            {/* Handle bar */}
            <View style={styles.bottomSheetHandle} />

            {/* Product header */}
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{scannedProduct.name}</Text>
              <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
              <Text style={styles.productBarcode}>Barcode: {scannedProduct.barcode}</Text>
            </View>

            {/* Quality score */}
            <QualityScore score={scannedProduct.qualityScore} />

            {/* Nutrients */}
            <View style={styles.nutrientsSection}>
              <Text style={styles.nutrientsTitle}>Nutritional Information</Text>
              <View style={styles.nutrientsGrid}>
                {Object.entries(scannedProduct.nutrients).map(([key, nutrient]) => (
                  <NutrientCard
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={nutrient.value}
                    unit={nutrient.unit}
                    per={nutrient.per}
                  />
                ))}
              </View>
            </View>

            {/* Health warnings */}
            {scannedProduct.healthWarnings.length > 0 && (
              <View style={styles.warningsSection}>
                <Text style={styles.warningsTitle}>Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="warning" size={16} color="#ff6b35" />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Benefits */}
            {scannedProduct.benefits.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>Health Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Scan another button */}
            <Button
              title="Scan Another Product"
              onPress={resetScanning}
              style={styles.scanAnotherButton}
              icon="scan-outline"
            />
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  permissionText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    position: 'relative',
    borderRadius: 12,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    top: 0,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  cameraButton: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  manualSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  scanButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  samplesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sampleButtons: {
    gap: 12,
  },
  sampleButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sampleButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#d32f2f',
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_MAX_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  productHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  productBarcode: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
  },
  nutrientsSection: {
    padding: 20,
  },
  nutrientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  warningsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  warningsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b35',
    marginBottom: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#ff6b35',
    marginLeft: 8,
    lineHeight: 20,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#4caf50',
    marginLeft: 8,
    lineHeight: 20,
  },
  scanAnotherButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});