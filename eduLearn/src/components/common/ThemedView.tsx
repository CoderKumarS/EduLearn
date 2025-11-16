import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type ViewVariant = 'default' | 'surface' | 'primary' | 'secondary';

interface ThemedViewProps extends ViewProps {
    variant?: ViewVariant;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
    variant = 'default',
    style,
    ...props
}) => {
    const { theme } = useTheme();

    const getBackgroundColor = (): string => {
        switch (variant) {
            case 'surface':
                return theme.colors.surface;
            case 'primary':
                return theme.colors.primary;
            case 'secondary':
                return theme.colors.secondary;
            case 'default':
            default:
                return theme.colors.background;
        }
    };

    const backgroundColor = getBackgroundColor();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor },
                style,
            ]}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        // Base styles can be added here if needed
    },
});
