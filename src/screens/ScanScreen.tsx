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

  const handleSampleBarcode = (barcode: string) => {
    setManualBarcode(barcode);
  };

  const showBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT,
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
    } else {
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
        scanningAnimation.setValue(0);
      }
    }

    return () => {
      if (scanningAnimationRef.current) {
        scanningAnimationRef.current.stop();
      }
    };
  }, [showCamera, scanningAnimation]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'codabar', 'itf14', 'pdf417', 'qr'],
          }}
        />
        
        <View style={styles.overlay}>
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

        <View style={styles.cameraControls}>
          <Text style={styles.scanningStatusText}>{scanningStatus}</Text>
          {isProcessing && <ActivityIndicator size="large" color="#fff" />}
          <TouchableOpacity 
            style={styles.closeCameraButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.closeCameraText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="scan" size={64} color={theme.colors.primary} />
          <Text style={styles.title}>Barcode Scanner</Text>
          <Text style={styles.subtitle}>Scan products to get nutritional information</Text>
        </View>

        <View style={styles.scanOptions}>
          <Button
            title="Start Camera Scan"
            onPress={openCamera}
            style={styles.scanButton}
          />

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <Text style={styles.manualTitle}>Enter barcode manually:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter barcode number"
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="numeric"
          />
          
          <Button
            title="Scan Manually"
            onPress={handleManualScan}
            variant="outline"
            style={styles.manualButton}
          />

          <Text style={styles.sampleTitle}>Try sample barcodes:</Text>
          <View style={styles.sampleContainer}>
            {sampleBarcodes.map((barcode) => (
              <TouchableOpacity
                key={barcode}
                style={styles.sampleButton}
                onPress={() => handleSampleBarcode(barcode)}
              >
                <Text style={styles.sampleText}>{barcode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: bottomSheetTranslateY }],
          }
        ]}
      >
        {scannedProduct && (
          <ScrollView style={styles.productContainer}>
            <View style={styles.productHeader}>
              <QualityScore score={scannedProduct.qualityScore} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{scannedProduct.name}</Text>
                <Text style={styles.brandName}>{scannedProduct.brand}</Text>
                <Text style={styles.barcode}>Barcode: {scannedProduct.barcode}</Text>
              </View>
            </View>

            <View style={styles.nutrientsGrid}>
              <NutrientCard 
                name="Calories"
                value={scannedProduct.nutrients.calories.value}
                unit={scannedProduct.nutrients.calories.unit}
                per={scannedProduct.nutrients.calories.per}
                color={theme.colors.primary}
              />
              <NutrientCard 
                name="Protein"
                value={scannedProduct.nutrients.protein.value}
                unit={scannedProduct.nutrients.protein.unit}
                per={scannedProduct.nutrients.protein.per}
                color={theme.colors.success}
              />
              <NutrientCard 
                name="Carbs"
                value={scannedProduct.nutrients.carbs.value}
                unit={scannedProduct.nutrients.carbs.unit}
                per={scannedProduct.nutrients.carbs.per}
                color={theme.colors.warning}
              />
              <NutrientCard 
                name="Fat"
                value={scannedProduct.nutrients.fat.value}
                unit={scannedProduct.nutrients.fat.unit}
                per={scannedProduct.nutrients.fat.per}
                color={theme.colors.error}
              />
              <NutrientCard 
                name="Fiber"
                value={scannedProduct.nutrients.fiber.value}
                unit={scannedProduct.nutrients.fiber.unit}
                per={scannedProduct.nutrients.fiber.per}
                color={theme.colors.success}
              />
              <NutrientCard 
                name="Sugar"
                value={scannedProduct.nutrients.sugar.value}
                unit={scannedProduct.nutrients.sugar.unit}
                per={scannedProduct.nutrients.sugar.per}
                color={theme.colors.warning}
              />
              <NutrientCard 
                name="Sodium"
                value={scannedProduct.nutrients.sodium.value}
                unit={scannedProduct.nutrients.sodium.unit}
                per={scannedProduct.nutrients.sodium.per}
                color={theme.colors.error}
              />
            </View>

            {scannedProduct.benefits.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Benefits</Text>
                {scannedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}

            {scannedProduct.healthWarnings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Warnings</Text>
                {scannedProduct.healthWarnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="warning" size={20} color={theme.colors.warning} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title="Scan Another Product"
              onPress={resetScanning}
              style={styles.resetButton}
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
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanOptions: {
    paddingHorizontal: 20,
  },
  scanButton: {
    marginBottom: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 16,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  manualButton: {
    marginBottom: 30,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  sampleContainer: {
    gap: 8,
  },
  sampleButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sampleText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
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
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanningStatusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeCameraButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  closeCameraText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  productContainer: {
    flex: 1,
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productInfo: {
    marginLeft: 16,
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  barcode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  resetButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});