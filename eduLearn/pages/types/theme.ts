import { TextStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorScheme {
  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Accent colors
  accent: string;
  success: string;
  warning: string;
  error: string;

  // UI element colors
  border: string;
  divider: string;
  shadow: string;
  overlay: string;
  notification: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  small: TextStyle;
}

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorScheme;
  spacing: Spacing;
  borderRadius: BorderRadius;
  typography: Typography;
}

export interface ThemeContextType {
  theme: ThemeState;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}