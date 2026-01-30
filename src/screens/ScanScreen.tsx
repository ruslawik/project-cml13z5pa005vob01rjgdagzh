import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

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

  const handleBarcodeScanned = (data: { data: string }) => {
    if (scannedBarcode === data.data) return; // Prevent multiple scans of same barcode
    
    setScannedBarcode(data.data);
    handleBarcodeProcessing(data.data);
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

  const hideBottomSheet = () => {
    Animated.spring(bottomSheetTranslateY, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"]
            }}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstructions}>Position barcode within the frame</Text>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
                <Text style={styles.cameraButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {scanningStatus && (
          <View style={styles.statusContainer}>
            {isProcessing && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.statusLoader} />}
            <Text style={styles.statusText}>{scanningStatus}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Ionicons name="barcode-outline" size={80} color={theme.colors.primary} />
        <Text style={styles.title}>Product Barcode Scanner</Text>
        
        {scanningStatus && (
          <View style={styles.statusContainer}>
            {isProcessing && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.statusLoader} />}
            <Text style={styles.statusText}>{scanningStatus}</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Scan with Camera"
            onPress={openCamera}
            style={styles.scanButton}
            disabled={isProcessing}
          />
          
          <View style={styles.divider} />
          
          <Text style={styles.orText}>Or enter barcode manually:</Text>
          
          <View style={styles.manualInputContainer}>
            <TextInput
              style={styles.barcodeInput}
              placeholder="Enter barcode number"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              editable={!isProcessing}
            />
            <TouchableOpacity
              style={[styles.manualScanButton, isProcessing && styles.buttonDisabled]}
              onPress={handleManualScan}
              disabled={isProcessing}
            >
              <Text style={[styles.manualScanButtonText, isProcessing && styles.buttonTextDisabled]}>
                Scan
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sampleText}>Try these sample barcodes:</Text>
          <View style={styles.sampleContainer}>
            {sampleBarcodes.map((barcode) => (
              <TouchableOpacity
                key={barcode}
                style={[styles.sampleButton, isProcessing && styles.buttonDisabled]}
                onPress={() => handleSampleScan(barcode)}
                disabled={isProcessing}
              >
                <Text style={[styles.sampleButtonText, isProcessing && styles.buttonTextDisabled]}>
                  {barcode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {scannedProduct && (
        <Animated.View 
          style={[styles.bottomSheet, { transform: [{ translateY: bottomSheetTranslateY }] }]}
        >
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHandle} />
            <TouchableOpacity style={styles.expandButton} onPress={expandBottomSheet}>
              <Ionicons name="chevron-up" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.bottomSheetContent} onPress={expandBottomSheet}>
            <Text style={styles.productName}>{scannedProduct.name}</Text>
            <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
            <QualityScore score={scannedProduct.qualityScore} size="small" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.collapseButton} onPress={collapseBottomSheet}>
            <Ionicons name="chevron-down" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.expandedContent}>
            <View style={styles.nutrientsList}>
              <NutrientCard
                title="Calories"
                value={`${scannedProduct.nutrients.calories.value} ${scannedProduct.nutrients.calories.unit}`}
                subtitle={`per ${scannedProduct.nutrients.calories.per}`}
              />
              <NutrientCard
                title="Protein"
                value={`${scannedProduct.nutrients.protein.value} ${scannedProduct.nutrients.protein.unit}`}
                subtitle={`per ${scannedProduct.nutrients.protein.per}`}
              />
              <NutrientCard
                title="Carbohydrates"
                value={`${scannedProduct.nutrients.carbs.value} ${scannedProduct.nutrients.carbs.unit}`}
                subtitle={`per ${scannedProduct.nutrients.carbs.per}`}
              />
              <NutrientCard
                title="Fat"
                value={`${scannedProduct.nutrients.fat.value} ${scannedProduct.nutrients.fat.unit}`}
                subtitle={`per ${scannedProduct.nutrients.fat.per}`}
              />
              <NutrientCard
                title="Fiber"
                value={`${scannedProduct.nutrients.fiber.value} ${scannedProduct.nutrients.fiber.unit}`}
                subtitle={`per ${scannedProduct.nutrients.fiber.per}`}
              />
              <NutrientCard
                title="Sugar"
                value={`${scannedProduct.nutrients.sugar.value} ${scannedProduct.nutrients.sugar.unit}`}
                subtitle={`per ${scannedProduct.nutrients.sugar.per}`}
              />
              <NutrientCard
                title="Sodium"
                value={`${scannedProduct.nutrients.sodium.value} ${scannedProduct.nutrients.sodium.unit}`}
                subtitle={`per ${scannedProduct.nutrients.sodium.per}`}
              />
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
            
            <TouchableOpacity style={styles.resetButton} onPress={resetScanning}>
              <Text style={styles.resetButtonText}>Scan Another Product</Text>
            </TouchableOpacity>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  scanButton: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 20,
  },
  orText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  manualInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  barcodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  manualScanButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  manualScanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sampleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  sampleContainer: {
    gap: 8,
  },
  sampleButton: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sampleButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  statusLoader: {
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: `${theme.colors.error}10`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.error}30`,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cameraButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    shadowRadius: 4,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: 10,
  },
  expandButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  collapseButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  bottomSheetContent: {
    padding: 20,
    paddingTop: 10,
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
    marginBottom: 10,
  },
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT - 150,
  },
  nutrientsList: {
    marginBottom: 20,
  },
  warningsContainer: {
    marginBottom: 20,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.error,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.success,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});