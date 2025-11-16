import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    iconColor,
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.value,
                            theme.typography.h2,
                            { color: theme.colors.text },
                        ]}
                    >
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </Text>
                    <Text
                        style={[
                            styles.label,
                            theme.typography.caption,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {label}
                    </Text>
                </View>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: iconColor || theme.colors.primary + '20' },
                    ]}
                >
                    {icon}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        borderWidth: 1,
        marginHorizontal: 4,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    value: {
        marginBottom: 4,
    },
    label: {
        textTransform: 'capitalize',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});
