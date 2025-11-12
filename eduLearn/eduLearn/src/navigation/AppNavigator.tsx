import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from '../screens/SplashScreen';
import TestScreen from '../screens/TestScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../contexts/ThemeContext';

export type RootStackParamList = {
    Splash: undefined;
    Test: undefined;
    Login: undefined;
    MainTabs: undefined;
};

export type TabParamList = {
    Home: undefined;
    Courses: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator Component
const MainTabs: React.FC = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color, size }) => {
                        // HIGH RISK: Wrap focused boolean with Boolean()
                        const isFocused = Boolean(focused);
                        const iconName = isFocused ? 'home' : 'home';

                        // For now, return a simple text icon
                        // In production, use actual icon library
                        return <ThemedText style={{ color, fontSize: size }}>🏠</ThemedText>;
                    },
                }}
            />
            <Tab.Screen
                name="Courses"
                component={CoursesScreen}
                options={{
                    title: 'Courses',
                    tabBarIcon: ({ focused, color, size }) => {
                        // HIGH RISK: Wrap focused boolean with Boolean()
                        const isFocused = Boolean(focused);
                        const iconName = isFocused ? 'book' : 'book';

                        // For now, return a simple text icon
                        return <ThemedText style={{ color, fontSize: size }}>📚</ThemedText>;
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color, size }) => {
                        // HIGH RISK: Wrap focused boolean with Boolean()
                        const isFocused = Boolean(focused);
                        const iconName = isFocused ? 'user' : 'user';

                        // For now, return a simple text icon
                        return <ThemedText style={{ color, fontSize: size }}>👤</ThemedText>;
                    },
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const { theme } = useTheme();

    // HIGH RISK AREA: Wrap isDark with Boolean() before passing to NavigationContainer
    const navigationTheme = Boolean(theme.isDark) ? DarkTheme : DefaultTheme;

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                    gestureEnabled: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                    animation: 'default',
                }}
            >
                <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                    options={{
                        title: 'eduLearn',
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        animation: 'fade',
                    }}
                />
                <Stack.Screen
                    name="Test"
                    component={TestScreen}
                    options={{
                        title: 'Test Screen',
                        headerLeft: () => null,
                        headerShown: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        title: 'Sign In',
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
