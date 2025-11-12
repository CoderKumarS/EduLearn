console.log('64. AppNavigator - Starting imports');
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
console.log('65. AppNavigator - React Navigation imported');
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
console.log('66. AppNavigator - Contexts imported');
import { SplashScreen } from '../screens/SplashScreen';
import { TestScreen } from '../screens/TestScreen';

export type RootStackParamList = {
    Splash: undefined;
    Test: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

console.log('250. Minimal AppNavigator - Component defined');

export const AppNavigator: React.FC = () => {
    console.log('67. AppNavigator - Component rendering');
    const { authState } = useAuth();
    console.log('68. AppNavigator - useAuth called');
    const { theme } = useTheme();
    console.log('69. AppNavigator - useTheme called');
    const [showSplash, setShowSplash] = useState(true);
    console.log('70. AppNavigator - useState initialized');

    const handleSplashFinish = () => {
        console.log('71. AppNavigator - handleSplashFinish called');
        setShowSplash(false);
    };

    // Show splash screen while auth is loading or during initial splash
    if (showSplash || authState.isLoading) {
        console.log('72. AppNavigator - Showing splash screen');
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    console.log('73. AppNavigator - About to render NavigationContainer');
    console.log('73a. AppNavigator - theme.isDark value:', theme.isDark, 'type:', typeof theme.isDark);
    console.log('73b. AppNavigator - Boolean(theme.isDark):', Boolean(theme.isDark), 'type:', typeof Boolean(theme.isDark));

    return (
        <NavigationContainer
            onStateChange={(state) => {
                console.log('74. NavigationContainer - State changed');
            }}
            onReady={() => {
                console.log('75. NavigationContainer - Ready');
                console.log('75a. NavigationContainer - Ready completed successfully');
            }}
            theme={{
                dark: Boolean(theme.isDark),
                colors: {
                    primary: theme.colors.primary,
                    background: theme.colors.background,
                    card: theme.colors.card,
                    text: theme.colors.text,
                    border: theme.colors.border,
                    notification: theme.colors.notification,
                },
                fonts: {
                    regular: {
                        fontFamily: 'System',
                        fontWeight: '400',
                    },
                    medium: {
                        fontFamily: 'System',
                        fontWeight: '500',
                    },
                    bold: {
                        fontFamily: 'System',
                        fontWeight: '700',
                    },
                    heavy: {
                        fontFamily: 'System',
                        fontWeight: '900',
                    },
                },
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.background,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontWeight: '700',
                    },
                }}
            >
                {console.log('310. Stack.Navigator - Rendering TestScreen')}
                <Stack.Screen
                    name="Test"
                    component={TestScreen}
                    options={{
                        title: 'Test Screen',
                        headerShown: Boolean(false)
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
