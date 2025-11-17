import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accentColor?: string;
    onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    accentColor,
    onPress,
}) => {
    const { theme } = useTheme();
    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            style={[styles.container, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.topRow}>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Text>
                <View style={[styles.iconContainer, { backgroundColor: (accentColor || theme.colors.primary) + '20' }]}>
                    {icon}
                </View>
            </View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                {label}
            </Text>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginHorizontal: 4,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    value: {
        fontSize: 32,
        fontWeight: '700',
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        width: '100%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
