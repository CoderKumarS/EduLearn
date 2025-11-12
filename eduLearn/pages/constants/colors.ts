import { ColorScheme, Spacing, BorderRadius, Typography } from '../types/theme';

export const lightColors: ColorScheme = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',

  // Text
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Primary
  primary: '#3D3BF3',
  primaryLight: '#6B69F5',
  primaryDark: '#2A29C4',

  // Accent
  accent: '#00D9FF',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  // UI
  border: '#E0E0E0',
  divider: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  notification: '#F44336',
};

export const darkColors: ColorScheme = {
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',

  // Primary
  primary: '#5B59F7',
  primaryLight: '#7D7BF9',
  primaryDark: '#3D3BF3',

  // Accent
  accent: '#00D9FF',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',

  // UI
  border: '#3A3A3A',
  divider: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  notification: '#EF5350',
};

export const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius: BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography: Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};