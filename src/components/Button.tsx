import React from 'react';
import { View, Pressable, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'apple';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export default function Button({ 
  title, 
  onPress, 
  disabled = false, 
  variant = 'primary',
  icon,
  style 
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isApple = variant === 'apple';
  
  if (isApple && title === 'Scan Barcodes') {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={theme.gradients.scanButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.appleGradient}
        >
          <Pressable
            style={({ pressed }) => [
              styles.pressable,
              pressed && styles.pressed
            ]}
            onPress={onPress}
            disabled={disabled}
          >
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.appleText}>
              {title}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container,
      isPrimary ? styles.primaryContainer : styles.outlineContainer,
      disabled && styles.disabledContainer,
      style
    ]}>
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isPrimary ? '#fff' : theme.colors.primary}
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.outlineText,
          disabled && styles.disabledText
        ]}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = {
  container: {
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabledContainer: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
  appleGradient: {
    borderRadius: 12,
  },
  pressable: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  appleIcon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 8,
  },
  appleText: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600' as const,
    color: '#fff',
    textAlign: 'center' as const,
  },
};