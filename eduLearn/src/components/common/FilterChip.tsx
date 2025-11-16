import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FilterChipProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
    label,
    isSelected,
    onPress,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: Boolean(isSelected)
                        ? theme.colors.primary
                        : 'transparent',
                    borderColor: Boolean(isSelected)
                        ? theme.colors.primary
                        : theme.colors.border,
                    borderRadius: theme.borderRadius.full,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: Boolean(isSelected) }}
            accessibilityLabel={`Filter by ${label}`}
        >
            <Text
                style={[
                    styles.label,
                    theme.typography.body,
                    {
                        color: Boolean(isSelected) ? '#FFFFFF' : theme.colors.text,
                    },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        marginRight: 8,
    },
    label: {
        fontWeight: '600',
    },
});
