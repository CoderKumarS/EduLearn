import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface NavigationCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onPress: () => void;
    iconBackgroundColor?: string;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
    icon,
    title,
    description,
    onPress,
    iconBackgroundColor,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    shadowColor: theme.colors.shadow,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${description}`}
        >
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: iconBackgroundColor || theme.colors.primary,
                        borderRadius: theme.borderRadius.md,
                    },
                ]}
            >
                {icon}
            </View>

            <View style={styles.textContainer}>
                <Text
                    style={[
                        styles.title,
                        theme.typography.h3,
                        { color: theme.colors.text },
                    ]}
                >
                    {title}
                </Text>
                <Text
                    style={[
                        styles.description,
                        theme.typography.caption,
                        { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={2}
                >
                    {description}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.chevron}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
    },
    description: {
        lineHeight: 18,
    },
    chevron: {
        marginLeft: 8,
    },
});
