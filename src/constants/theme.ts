export const theme = {
  colors: {
    primary: '#000000',
    secondary: '#666666',
    success: '#000000',
    warning: '#333333',
    error: '#000000',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    disabled: '#CCCCCC',
    card: '#FFFFFF',
    shadow: '#000000',
    accent: '#F5F5F5',
  },
  gradients: {
    primary: ['#000000', '#333333'],
    secondary: ['#666666', '#999999'],
    card: ['#FFFFFF', '#F8F8F8'],
    accent: ['#F0F0F0', '#FFFFFF'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    heading: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    subheading: {
      fontSize: 18,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
    },
  },
};