import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { RootStackParamList } from '../../navigation/AppNavigator';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
    onInitializationComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onInitializationComplete }) => {
    const navigation = useNavigation<SplashScreenNavigationProp>();
    const { theme } = useTheme();
    const { isLoading } = useAuth();

    useEffect(() => {
        // Initialization logic
        const initializeApp = async () => {
            try {
                // Simulate initialization tasks
                // In a real app, this would include:
                // - Loading user preferences
                // - Checking authentication status
                // - Loading cached data
                // - Initializing services

                // Wait for auth context to finish loading
                if (!Boolean(isLoading)) {
                    // Small delay to show splash screen
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Navigate to MainTabs after initialization
                    navigation.replace('MainTabs');

                    // Notify that initialization is complete
                    if (onInitializationComplete) {
                        onInitializationComplete();
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
                // Even on error, we should proceed to avoid blocking the app
                navigation.replace('MainTabs');
                if (onInitializationComplete) {
                    onInitializationComplete();
                }
            }
        };

        initializeApp();
    }, [isLoading, onInitializationComplete, navigation]);

    return (
        <ThemedView variant="default" style={styles.container}>
            {/* App Logo */}
            <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* App Name */}
            <ThemedText
                variant="default"
                size="xxl"
                weight="bold"
                style={styles.appName}
            >
                eduLearn
            </ThemedText>

            {/* Tagline */}
            <ThemedText
                variant="secondary"
                size="md"
                style={styles.tagline}
            >
                Your AI-Powered Learning Companion
            </ThemedText>

            {/* Loading Indicator */}
            <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={styles.loader}
            />

            {/* Loading Text */}
            <ThemedText
                variant="secondary"
                size="sm"
                style={styles.loadingText}
            >
                Initializing...
            </ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 24,
    },
    appName: {
        marginBottom: 8,
    },
    tagline: {
        marginBottom: 48,
        textAlign: 'center',
    },
    loader: {
        marginBottom: 16,
    },
    loadingText: {
        opacity: 0.7,
    },
});

export default SplashScreen;
