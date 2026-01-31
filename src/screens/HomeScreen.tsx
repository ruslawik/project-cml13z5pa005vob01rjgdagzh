import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../types';
import Button from '../components/Button';
import { theme } from '../constants/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleScanPress = () => {
    navigation.navigate('Scan');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.header}
        >
          <Ionicons name="nutrition" size={80} color="#fff" />
          <Text style={styles.title}>Nutrient Scanner</Text>
          <Text style={styles.subtitle}>
            Scan food barcodes to get instant nutrient quality assessment
          </Text>
        </LinearGradient>

        <View style={styles.mainSection}>
          <Button
            title="Scan Barcodes"
            onPress={handleScanPress}
            icon="scan"
            style={styles.scanButton}
            variant="apple"
          />
        </View>

        <View style={styles.infoSection}>
          <LinearGradient
            colors={theme.gradients.feature1}
            style={styles.featureCard}
          >
            <Ionicons name="star" size={32} color="#fff" />
            <Text style={styles.featureTitle}>Quality Rating</Text>
            <Text style={styles.featureDescription}>
              Get nutrient quality scores from 0 to 100
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={theme.gradients.feature2}
            style={styles.featureCard}
          >
            <Ionicons name="shield-checkmark" size={32} color="#fff" />
            <Text style={styles.featureTitle}>Safety Analysis</Text>
            <Text style={styles.featureDescription}>
              Learn how safe or dangerous ingredients are
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={theme.gradients.feature3}
            style={styles.featureCard}
          >
            <Ionicons name="analytics" size={32} color="#fff" />
            <Text style={styles.featureTitle}>Detailed Info</Text>
            <Text style={styles.featureDescription}>
              Complete nutrient breakdown and health insights
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center' as const,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center' as const,
    lineHeight: 24,
    maxWidth: 280,
    opacity: 0.9,
  },
  mainSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  scanButton: {
    marginBottom: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center' as const,
    minHeight: 140,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  featureDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center' as const,
    lineHeight: 20,
    opacity: 0.9,
  },
};