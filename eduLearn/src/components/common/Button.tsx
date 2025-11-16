import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from './ThemedText';

interface ButtonProps extends Omit<TouchableOpacityProps, 'children' | 'disabled'> {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: string;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    disabled,
    loading,
    style,
    ...props
}) => {
    const { theme } = useTheme();

    // Wrap boolean props with Boolean() constructor for safety
    const isDisabled = Boolean(disabled || loading);
    const isLoading = Boolean(loading);

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: theme.colors.primary },
                isDisabled && styles.buttonDisabled,
                isDisabled && { backgroundColor: theme.colors.border },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={isDisabled}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <ThemedText
                    variant="default"
                    size="md"
                    weight="semibold"
                    style={styles.buttonText}
                >
                    {title}
                </ThemedText>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFFFFF',
    },
});
