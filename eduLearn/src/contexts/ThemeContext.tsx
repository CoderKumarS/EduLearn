import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeState, ThemeMode, ThemeContextType } from '../types/theme';
import { lightColors, darkColors, spacing, borderRadius, typography } from '../constants/colors';

// Theme reducer
type ThemeAction =
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_SYSTEM_THEME'; payload: boolean }
  | { type: 'TOGGLE_THEME' };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME_MODE':
      const newMode = action.payload;
      let isDark = state.isDark;

      if (newMode === 'system') {
        isDark = Appearance.getColorScheme() === 'dark';
      } else {
        isDark = newMode === 'dark';
      }

      return {
        ...state,
        mode: newMode,
        isDark,
        colors: isDark ? darkColors : lightColors,
      };

    case 'SET_SYSTEM_THEME':
      if (state.mode === 'system') {
        return {
          ...state,
          isDark: action.payload,
          colors: action.payload ? darkColors : lightColors,
        };
      }
      return state;

    case 'TOGGLE_THEME':
      const toggledMode = state.mode === 'light' ? 'dark' : 'light';
      return {
        ...state,
        mode: toggledMode,
        isDark: toggledMode === 'dark',
        colors: toggledMode === 'dark' ? darkColors : lightColors,
      };

    default:
      return state;
  }
};

// Initial state
const getInitialTheme = (): ThemeState => {
  const systemColorScheme = Appearance.getColorScheme();
  const isDark = systemColorScheme === 'dark';

  return {
    mode: 'system',
    isDark,
    colors: isDark ? darkColors : lightColors,
    spacing,
    borderRadius,
    typography,
  };
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, dispatch] = useReducer(themeReducer, getInitialTheme());

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          dispatch({ type: 'SET_THEME_MODE', payload: savedMode as ThemeMode });
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      dispatch({ type: 'SET_SYSTEM_THEME', payload: colorScheme === 'dark' });
    });

    return () => subscription?.remove();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('themeMode', theme.mode);
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }
    };

    saveThemePreference();
  }, [theme.mode]);

  const setThemeMode = (mode: ThemeMode) => {
    dispatch({ type: 'SET_THEME_MODE', payload: mode });
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const value: ThemeContextType = {
    theme,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};