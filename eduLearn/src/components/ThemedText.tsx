import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type TextVariant = 'default' | 'secondary' | 'primary' | 'error' | 'success' | 'warning';
type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface ThemedTextProps extends TextProps {
    variant?: TextVariant;
    size?: TextSize;
    weight?: TextWeight;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    variant = 'default',
    size = 'md',
    weight = 'regular',
    style,
    ...props
}) => {
    const { theme } = useTheme();

    const getTextColor = (): string => {
        switch (variant) {
            case 'secondary':
                return theme.colors.textSecondary;
            case 'primary':
                return theme.colors.primary;
            case 'error':
                return theme.colors.error;
            case 'success':
                return theme.colors.success;
            case 'warning':
                return theme.colors.warning;
            case 'default':
            default:
                return theme.colors.text;
        }
    };

    const textColor = getTextColor();
    const fontSize = theme.typography.fontSize[size];
    const fontWeight = theme.typography.fontWeight[weight];

    return (
        <Text
            style={[
                styles.text,
                {
                    color: textColor,
                    fontSize,
                    fontWeight,
                },
                style,
            ]}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    text: {
        // Base styles can be added here if needed
    },
});
