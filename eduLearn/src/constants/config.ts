import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface AppConfig {
    apiBaseUrl: string;
    apiAuthUrl: string;
    appName: string;
    nodeEnv: string;
}

// Get the appropriate base URL based on platform
const getDefaultBaseUrl = (): string => {
    // Check for environment variable first
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }

    // For Android emulator, use special alias for host machine
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/api';
    }

    // For iOS simulator and web, localhost works
    return 'http://localhost:8000/api';
};

const getDefaultAuthUrl = (): string => {
    // Check for environment variable first
    if (process.env.EXPO_PUBLIC_API_AUTH_URL) {
        return process.env.EXPO_PUBLIC_API_AUTH_URL;
    }

    // For Android emulator, use special alias for host machine
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/api/auth';
    }

    // For iOS simulator and web, localhost works
    return 'http://localhost:8000/api/auth';
};

const config: AppConfig = {
    apiBaseUrl: Constants.expoConfig?.extra?.apiBaseUrl || getDefaultBaseUrl(),
    apiAuthUrl: Constants.expoConfig?.extra?.apiAuthUrl || getDefaultAuthUrl(),
    appName: Constants.expoConfig?.extra?.appName || 'eduLearn',
    nodeEnv: Constants.expoConfig?.extra?.nodeEnv || 'development',
};

// Debug logging
console.log('=== API Configuration ===');
console.log('Platform:', Platform.OS);
console.log('API Base URL:', config.apiBaseUrl);
console.log('API Auth URL:', config.apiAuthUrl);
console.log('Environment Variables:');
console.log('  EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
console.log('  EXPO_PUBLIC_API_AUTH_URL:', process.env.EXPO_PUBLIC_API_AUTH_URL);
console.log('========================');

export default config;
