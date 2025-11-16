import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../contexts/ThemeContext';

interface QuickActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    iconColor?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    icon,
    label,
    onPress,
    iconColor,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={`Navigate to ${label}`}
        >
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: (iconColor || theme.colors.primary) + '20' },
                ]}
            >
                <Ionicons
                    name={icon}
                    size={24}
                    color={iconColor || theme.colors.primary}
                />
            </View>
            <ThemedText
                variant="default"
                size="sm"
                weight="semibold"
                style={styles.label}
                numberOfLines={2}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        minHeight: 100,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    label: {
        textAlign: 'center',
    },
});
