import 'dotenv/config';

export default {
    expo: {
        name: process.env.APP_NAME || 'eduLearn',
        slug: 'eduLearn',
        version: process.env.APP_VERSION || '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        updates: {
            enabled: false,
            fallbackToCacheTimeout: 0
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff'
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            package: 'com.edulearn.app'
        },
        web: {
            favicon: './assets/favicon.png'
        },
        extra: {
            apiBaseUrl: process.env.API_BASE_URL,
            apiAuthUrl: process.env.API_AUTH_URL,
            appName: process.env.APP_NAME,
            nodeEnv: process.env.NODE_ENV,
        }
    }
};