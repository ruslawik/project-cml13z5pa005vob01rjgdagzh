export const theme = {
  colors: {
    primary: '#000000',
    secondary: '#666666',
    success: '#000000',
    warning: '#333333',
    error: '#000000',
    background: '#D9D9D9',
    surface: '#D9D9D9',
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#CCCCCC',
    disabled: '#CCCCCC',
    card: '#F5F5F5',
    shadow: '#000000',
    accent: '#E6E6E6',
  },
  gradients: {
    primary: ['#000000', '#333333'],
    secondary: ['#666666', '#999999'],
    card: ['#F5F5F5', '#E6E6E6'],
    accent: ['#E6E6E6', '#F5F5F5'],
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