import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

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
        <View style={styles.header}>
          <Ionicons name="nutrition" size={80} color={theme.colors.primary} />
          <Text style={styles.title}>Nutrient Scanner</Text>
          <Text style={styles.subtitle}>
            Scan food barcodes to get instant nutrient quality assessment
          </Text>
        </View>

        <View style={styles.mainSection}>
          <Button
            title="Scan Barcodes"
            onPress={handleScanPress}
            icon="scan"
            style={styles.scanButton}
          />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.featureCard}>
            <Ionicons name="star" size={24} color={theme.colors.success} />
            <Text style={styles.featureTitle}>Quality Rating</Text>
            <Text style={styles.featureDescription}>
              Get nutrient quality scores from 0 to 100
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
            <Text style={styles.featureTitle}>Safety Analysis</Text>
            <Text style={styles.featureDescription}>
              Learn how safe or dangerous ingredients are
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="analytics" size={24} color={theme.colors.warning} />
            <Text style={styles.featureTitle}>Detailed Info</Text>
            <Text style={styles.featureDescription}>
              Complete nutrient breakdown and health insights
            </Text>
          </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    maxWidth: 280,
  },
  mainSection: {
    marginBottom: 40,
  },
  scanButton: {
    marginBottom: 20,
  },
  infoSection: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
};