import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import Button from '../components/Button';

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'annual'>('trial');

  const benefits = [
    {
      icon: 'scan' as keyof typeof Ionicons.glyphMap,
      title: 'Unlimited Scans',
      description: 'Scan as many products as you want without limits'
    },
    {
      icon: 'analytics' as keyof typeof Ionicons.glyphMap,
      title: 'Advanced Analytics',
      description: 'Get detailed nutrient breakdowns and health insights'
    },
    {
      icon: 'heart' as keyof typeof Ionicons.glyphMap,
      title: 'Health Tracking',
      description: 'Monitor your nutrition intake and health progress'
    },
    {
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      title: 'Premium Support',
      description: 'Priority customer support and exclusive features'
    }
  ];

  const handleSubscribe = () => {
    // Handle subscription logic here
    console.log(`Subscribing to ${selectedPlan} plan`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="star" size={60} color={theme.colors.text} />
          <Text style={styles.title}>Get Full Access</Text>
          <Text style={styles.subtitle}>
            Unlock all premium features and get the most out of your health journey
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon} size={24} color={theme.colors.text} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.subscriptionSection}>
          <View style={styles.planSwitcher}>
            <View style={[
              styles.planOption,
              selectedPlan === 'trial' ? styles.planOptionSelected : styles.planOptionUnselected
            ]}>
              <Pressable
                style={styles.planPressable}
                onPress={() => setSelectedPlan('trial')}
              >
                <Text style={[
                  styles.planTitle,
                  selectedPlan === 'trial' ? styles.planTitleSelected : styles.planTitleUnselected
                ]}>
                  7-Day Free Trial
                </Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === 'trial' ? styles.planPriceSelected : styles.planPriceUnselected
                ]}>
                  Then $9.99/month
                </Text>
              </Pressable>
            </View>

            <View style={[
              styles.planOption,
              selectedPlan === 'annual' ? styles.planOptionSelected : styles.planOptionUnselected
            ]}>
              <Pressable
                style={styles.planPressable}
                onPress={() => setSelectedPlan('annual')}
              >
                <Text style={[
                  styles.planTitle,
                  selectedPlan === 'annual' ? styles.planTitleSelected : styles.planTitleUnselected
                ]}>
                  Annual Plan
                </Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === 'annual' ? styles.planPriceSelected : styles.planPriceUnselected
                ]}>
                  $59.99/year
                </Text>
                <Text style={styles.planSavings}>Save 50%</Text>
              </Pressable>
            </View>
          </View>

          <Button
            title={selectedPlan === 'trial' ? 'Start Free Trial' : 'Subscribe Now'}
            onPress={handleSubscribe}
            style={styles.subscribeButton}
          />

          <Text style={styles.disclaimer}>
            Cancel anytime. No commitments.
          </Text>
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 20,
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
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: '400',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  subscriptionSection: {
    paddingHorizontal: 20,
  },
  planSwitcher: {
    marginBottom: 24,
    gap: 12,
  },
  planOption: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  planOptionSelected: {
    borderColor: theme.colors.text,
    backgroundColor: theme.colors.card,
  },
  planOptionUnselected: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  planPressable: {
    padding: 20,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planTitleSelected: {
    color: theme.colors.text,
  },
  planTitleUnselected: {
    color: theme.colors.textSecondary,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  planPriceSelected: {
    color: theme.colors.text,
  },
  planPriceUnselected: {
    color: theme.colors.textSecondary,
  },
  planSavings: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  subscribeButton: {
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});