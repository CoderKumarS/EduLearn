console.log('10. ThemeContext - Starting imports');
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
console.log('11. ThemeContext - About to import AsyncStorage');
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log('12. ThemeContext - AsyncStorage imported');
import { ThemeState, ThemeMode, ThemeContextType } from '../types/theme';
import { lightColors, darkColors, spacing, borderRadius, typography } from '../constants/colors';
console.log('13. ThemeContext - All imports done');

// Theme reducer
type ThemeAction =
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'TOGGLE_THEME' };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME_MODE':
      const isDark = Boolean(
        action.payload === 'dark' ||
        (action.payload === 'system' && Appearance.getColorScheme() === 'dark')
      );

      return {
        ...state,
        mode: action.payload,
        isDark,
        colors: isDark ? darkColors : lightColors,
      };

    case 'TOGGLE_THEME':
      const newMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
      const newIsDark = Boolean(newMode === 'dark');

      return {
        ...state,
        mode: newMode,
        isDark: newIsDark,
        colors: newIsDark ? darkColors : lightColors,
      };

    default:
      return state;
  }
};

// Get initial theme based on system preference
const getInitialTheme = (): ThemeState => {
  console.log('14. ThemeContext - getInitialTheme called');
  const systemColorScheme = Appearance.getColorScheme();
  const isDark = Boolean(systemColorScheme === 'dark');

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
console.log('15. ThemeContext - Context created');

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('16. ThemeProvider - Component rendering');
  const [theme, dispatch] = useReducer(themeReducer, getInitialTheme());
  console.log('17. ThemeProvider - useReducer initialized');

  // Load saved theme safely
  useEffect(() => {
    console.log('18. ThemeProvider - useEffect for restore starting');
    const restore = async () => {
      try {
        console.log('19. ThemeProvider - About to call AsyncStorage.getItem');
        const data = await AsyncStorage.getItem('themeMode');
        console.log('20. ThemeProvider - AsyncStorage.getItem completed, data:', data);

        if (!data) {
          console.log('21. ThemeProvider - No data found, returning');
          return;
        }

        // Validate the theme mode
        if (data === 'light' || data === 'dark' || data === 'system') {
          console.log('22. ThemeProvider - Dispatching theme mode:', data);
          dispatch({ type: 'SET_THEME_MODE', payload: data as ThemeMode });
        } else {
          console.log('23. ThemeProvider - Invalid theme mode, removing corrupted data');
          await AsyncStorage.removeItem('themeMode');
        }
      } catch (e) {
        console.error('24. ThemeProvider - Error in restore:', e);
      }
    };

    restore();
  }, []);

  // Save theme safely
  useEffect(() => {
    console.log('25. ThemeProvider - useEffect for save starting');
    const save = async () => {
      try {
        console.log('26. ThemeProvider - About to save theme:', theme.mode);
        await AsyncStorage.setItem('themeMode', theme.mode);
        console.log('27. ThemeProvider - Theme saved successfully');
      } catch (e) {
        console.error('28. ThemeProvider - Save failed:', e);
      }
    };
    save();
  }, [theme.mode]);

  // Listen to system theme changes
  useEffect(() => {
    console.log('29. ThemeProvider - useEffect for system theme listener');
    if (theme.mode !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('30. ThemeProvider - System theme changed:', colorScheme);
      dispatch({ type: 'SET_THEME_MODE', payload: 'system' });
    });

    return () => subscription.remove();
  }, [theme.mode]);

  const setThemeMode = (mode: ThemeMode) => {
    console.log('31. ThemeProvider - setThemeMode called:', mode);
    dispatch({ type: 'SET_THEME_MODE', payload: mode });
  };

  const toggleTheme = () => {
    console.log('32. ThemeProvider - toggleTheme called');
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const value: ThemeContextType = {
    theme,
    setThemeMode,
    toggleTheme,
  };

  console.log('33. ThemeProvider - Rendering children');
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

console.log('34. ThemeContext - Module loaded');
