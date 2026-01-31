import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';
import Button from '../components/Button';
import WeightProgressGraph from '../components/WeightProgressGraph';
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
        <WeightProgressGraph />

        <View style={styles.header}>
          <Ionicons name="nutrition" size={80} color={theme.colors.text} />
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
            <Ionicons name="star" size={32} color={theme.colors.text} />
            <Text style={styles.featureTitle}>Quality Rating</Text>
            <Text style={styles.featureDescription}>
              Get nutrient quality scores from 0 to 100
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="shield-checkmark" size={32} color={theme.colors.text} />
            <Text style={styles.featureTitle}>Safety Analysis</Text>
            <Text style={styles.featureDescription}>
              Learn how safe or dangerous ingredients are
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="analytics" size={32} color={theme.colors.text} />
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

const styles = StyleSheet.create({
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
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
    fontWeight: '400',
  },
  mainSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  scanButton: {
    marginBottom: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  featureCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    minHeight: 160,
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 250,
    fontWeight: '400',
  },
});