import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
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
      toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
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
      scanningAnimationRef.current?.stop();
      scanningAnimation.setValue(0);
    }

    return () => {
      scanningAnimationRef.current?.stop();
    };
  }, [showCamera]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.statusText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color={theme.colors.textSecondary} />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>
          Camera access is needed to scan product barcodes
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
            }}
          />
          
          <View style={styles.scanningOverlay}>
            <View style={styles.scanningFrame}>
              <Animated.View
                style={[
                  styles.scanningLine,
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
            </View>
            
            <View style={styles.scanningInfo}>
              <Text style={styles.scanningText}>{scanningStatus}</Text>
              <Text style={styles.scanningSubtext}>
                Position barcode within the frame
              </Text>
            </View>
          </View>

          <View style={styles.cameraControls}>
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, overflow: 'hidden' }}>
              <TouchableOpacity style={styles.closeButton} onPress={resetScanning}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
              <Ionicons name="barcode-outline" size={48} color={theme.colors.primary} />
              <Text style={styles.title}>Scan Product Barcode</Text>
              <Text style={styles.subtitle}>
                Scan any product to get detailed nutrition information
              </Text>
            </View>

            <View style={styles.actionSection}>
              <Button 
                title="Open Camera" 
                onPress={openCamera}
                disabled={isProcessing}
                icon="camera"
              />
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.manualInputSection}>
                <Text style={styles.sectionTitle}>Enter Barcode Manually</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter barcode number"
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  keyboardType="numeric"
                />
                <Button 
                  title="Scan Barcode" 
                  onPress={handleManualScan}
                  disabled={isProcessing}
                  style={styles.manualScanButton}
                />
              </View>

              <View style={styles.sampleSection}>
                <Text style={styles.sectionTitle}>Try Sample Products</Text>
                <View style={styles.sampleGrid}>
                  {sampleBarcodes.map((barcode) => {
                    const product = mockProductDatabase[barcode];
                    return (
                      <View key={barcode} style={{ backgroundColor: theme.colors.surface, borderRadius: 12, overflow: 'hidden' }}>
                        <TouchableOpacity
                          style={styles.sampleCard}
                          onPress={() => handleSampleScan(barcode)}
                          disabled={isProcessing}
                        >
                          <View style={styles.sampleHeader}>
                            <Text style={styles.sampleName} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <View style={[styles.sampleScoreBadge, { backgroundColor: product.qualityScore >= 80 ? theme.colors.success : product.qualityScore >= 60 ? theme.colors.warning : theme.colors.error }]}>
                              <Text style={styles.sampleScoreText}>{product.qualityScore}</Text>
                            </View>
                          </View>
                          <Text style={styles.sampleBrand}>{product.brand}</Text>
                          <Text style={styles.sampleBarcode}>{barcode}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {isProcessing && (
              <View style={styles.processingSection}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.processingText}>{scanningStatus}</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorSection}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {scannedProduct && (
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: bottomSheetTranslateY }],
                },
              ]}
            >
              <View style={styles.bottomSheetHandle} />
              
              <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
                <View style={styles.productHeader}>
                  <View style={styles.productTitleSection}>
                    <Text style={styles.productName}>{scannedProduct.name}</Text>
                    <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
                    <View style={styles.barcodeContainer}>
                      <Ionicons name="barcode-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.productBarcode}>{scannedProduct.barcode}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.qualityScoreContainer}>
                  <QualityScore score={scannedProduct.qualityScore} product={scannedProduct} />
                </View>

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

                {scannedProduct.benefits.length > 0 && (
                  <View style={styles.benefitsSection}>
                    <Text style={styles.sectionTitle}>Health Benefits</Text>
                    <View style={styles.benefitsList}>
                      {scannedProduct.benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {scannedProduct.healthWarnings.length > 0 && (
                  <View style={styles.warningsSection}>
                    <Text style={styles.sectionTitle}>Health Warnings</Text>
                    <View style={styles.warningsList}>
                      {scannedProduct.healthWarnings.map((warning, index) => (
                        <View key={index} style={styles.warningItem}>
                          <Ionicons name="warning" size={16} color={theme.colors.warning} />
                          <Text style={styles.warningText}>{warning}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.bottomSheetActions}>
                  <Button 
                    title="Scan Another Product" 
                    onPress={resetScanning}
                    style={styles.scanAnotherButton}
                  />
                </View>
              </ScrollView>
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  actionSection: {
    marginBottom: theme.spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  manualInputSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  manualScanButton: {
    backgroundColor: theme.colors.secondary,
  },
  sampleSection: {
    marginBottom: theme.spacing.xl,
  },
  sampleGrid: {
    gap: theme.spacing.md,
  },
  sampleCard: {
    padding: theme.spacing.md,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sampleName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  sampleScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  sampleScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sampleBrand: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  sampleBarcode: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  processingSection: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  processingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  errorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#fee2e2',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.error,
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
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
  scanningFrame: {
    width: 250,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: theme.borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  scanningLine: {
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
  scanningInfo: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scanningSubtext: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: theme.spacing.md,
    right: theme.spacing.md,
    alignItems: 'center',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_SHEET_MAX_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  productHeader: {
    marginBottom: theme.spacing.lg,
  },
  productTitleSection: {
    marginBottom: theme.spacing.md,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  productBrand: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productBarcode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginLeft: theme.spacing.xs,
  },
  qualityScoreContainer: {
    marginBottom: theme.spacing.lg,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  benefitsSection: {
    marginBottom: theme.spacing.lg,
  },
  benefitsList: {
    gap: theme.spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: '#f0f9f0',
    borderRadius: theme.borderRadius.sm,
  },
  benefitText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    flex: 1,
  },
  warningsSection: {
    marginBottom: theme.spacing.lg,
  },
  warningsList: {
    gap: theme.spacing.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: '#fff8f0',
    borderRadius: theme.borderRadius.sm,
  },
  warningText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    flex: 1,
  },
  bottomSheetActions: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  scanAnotherButton: {
    backgroundColor: theme.colors.primary,
  },
});