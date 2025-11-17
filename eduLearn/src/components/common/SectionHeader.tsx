import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onViewAllPress?: () => void;
    viewAllText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    icon,
    onViewAllPress,
    viewAllText = 'View All',
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.leftContent}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={24}
                        color={theme.colors.primary}
                        style={styles.icon}
                    />
                )}
                <Text
                    style={[
                        styles.title,
                        theme.typography.h3,
                        { color: theme.colors.text },
                    ]}
                >
                    {title}
                </Text>
            </View>
            {onViewAllPress && (
                <TouchableOpacity
                    onPress={onViewAllPress}
                    activeOpacity={0.7}
                    style={styles.viewAllButton}
                >
                    <Text
                        style={[
                            styles.viewAllText,
                            { color: theme.colors.primary },
                        ]}
                    >
                        {viewAllText}
                    </Text>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 8,
    },
    title: {
        flex: 1,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
});
