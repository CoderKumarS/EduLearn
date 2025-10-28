export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorScheme {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorScheme;
}

export interface ThemeContextType {
  theme: ThemeState;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}