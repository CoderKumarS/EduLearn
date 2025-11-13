import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeState, ThemeMode } from '../types/theme';
import { lightColors, darkColors, spacing, borderRadius, typography } from '../constants/colors';

interface ThemeContextType {
    theme: ThemeState;
    setLightTheme: () => void;
    setDarkTheme: () => void;
    setSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

// AsyncStorage key for theme persistence
const THEME_STORAGE_KEY = 'themeMode';

// Load theme from AsyncStorage
const loadTheme = async (): Promise<ThemeMode> => {
    try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
            return savedTheme;
        }
        return 'system'; // Default to system if no valid saved theme
    } catch (error) {
        console.error('Error loading theme from AsyncStorage:', error);
        return 'system'; // Default to system on error
    }
};

// Save theme to AsyncStorage
const saveTheme = async (themeMode: ThemeMode): Promise<void> => {
    try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
        console.error('Error saving theme to AsyncStorage:', error);
    }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');
    const [isLoading, setIsLoading] = useState<boolean>(Boolean(true));

    // Create isDark with Boolean() constructor - HIGH RISK AREA
    const getIsDark = (themeMode: ThemeMode): boolean => {
        if (themeMode === 'light') {
            return Boolean(false);
        }
        if (themeMode === 'dark') {
            return Boolean(true);
        }
        // System mode - wrap the comparison with Boolean()
        return Boolean(systemColorScheme === 'dark');
    };

    const isDark = getIsDark(mode);

    const theme: ThemeState = {
        mode,
        isDark: Boolean(isDark), // Extra safety: wrap again
        colors: isDark ? darkColors : lightColors,
        spacing,
        borderRadius,
        typography,
    };

    // Load saved theme on app initialization
    useEffect(() => {
        const initializeTheme = async () => {
            const savedTheme = await loadTheme();
            setMode(savedTheme);
            setIsLoading(Boolean(false));
        };
        initializeTheme();
    }, []);

    // Save theme whenever it changes
    useEffect(() => {
        if (!isLoading) {
            saveTheme(mode);
        }
    }, [mode, isLoading]);

    const setLightTheme = () => {
        setMode('light');
    };

    const setDarkTheme = () => {
        setMode('dark');
    };

    const setSystemTheme = () => {
        setMode('system');
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setLightTheme,
                setDarkTheme,
                setSystemTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
