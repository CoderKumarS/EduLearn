import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
    const { theme } = useTheme();
    const spinValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Spin animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <ThemedView variant="default" style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeValue,
                    },
                ]}
            >
                {/* Animation container - keeps circle and icon aligned */}
                <View style={styles.animationContainer}>
                    {/* Outer rotating circle */}
                    <Animated.View
                        style={[
                            styles.outerCircle,
                            {
                                borderColor: theme.colors.primary + '30',
                                transform: [{ rotate: spin }],
                            },
                        ]}
                    >
                        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                    </Animated.View>

                    {/* Inner pulsing icon - positioned absolutely to center */}
                    <Animated.View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: theme.colors.primary + '20',
                                transform: [{ scale: scaleValue }],
                            },
                        ]}
                    >
                        <Ionicons name="school-outline" size={40} color={theme.colors.primary} />
                    </Animated.View>
                </View>

                {/* Loading text */}
                <ThemedText variant="default" size="lg" weight="semibold" style={styles.message}>
                    {message}
                </ThemedText>

                {/* Animated dots */}
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    />
                </View>
            </Animated.View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    animationContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    outerCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
        top: -6,
        left: '50%',
        marginLeft: -6,
    },
    iconContainer: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: 32,
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
