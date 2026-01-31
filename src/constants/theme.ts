export const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#D9D9D9',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    disabled: '#cbd5e1',
  },
  gradients: {
    primary: ['#667eea', '#764ba2'],
    success: ['#11998e', '#38ef7d'],
    warning: ['#f093fb', '#f5576c'],
    info: ['#4facfe', '#00f2fe'],
    appleGreen: ['#00b09b', '#96c93d'],
    appleBlue: ['#667eea', '#764ba2'],
    scanButton: ['#34d399', '#3b82f6'],
    feature1: ['#ff9a9e', '#fecfef'],
    feature2: ['#a8edea', '#fed6e3'],
    feature3: ['#ffecd2', '#fcb69f'],
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