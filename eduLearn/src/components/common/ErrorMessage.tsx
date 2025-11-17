import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
    compact?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message = 'Something went wrong',
    onRetry,
    compact = false,
}) => {
    const { theme } = useTheme();

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={theme.colors.error}
                />
                <Text
                    style={[
                        styles.compactMessage,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {message}
                </Text>
                {onRetry && (
                    <TouchableOpacity
                        onPress={onRetry}
                        style={styles.compactRetryButton}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.compactRetryText,
                                { color: theme.colors.primary },
                            ]}
                        >
                            Retry
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Ionicons
                name="alert-circle-outline"
                size={48}
                color={theme.colors.error}
            />
            <Text
                style={[
                    styles.message,
                    { color: theme.colors.text },
                ]}
            >
                {message}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    style={[
                        styles.retryButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 32,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    compactMessage: {
        fontSize: 14,
        flex: 1,
    },
    compactRetryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    compactRetryText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
