import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AlertCardProps {
    type: 'critical' | 'warning' | 'info';
    icon: React.ReactNode;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
    type,
    icon,
    title,
    message,
    actionLabel,
    onAction,
}) => {
    const { theme } = useTheme();

    const getBackgroundColor = () => {
        switch (type) {
            case 'critical':
                return theme.colors.error + '15';
            case 'warning':
                return theme.colors.warning + '15';
            case 'info':
                return theme.colors.primary + '15';
            default:
                return theme.colors.surface;
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'critical':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            case 'info':
                return theme.colors.primary;
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            <View style={styles.content}>
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: getIconColor() + '20',
                            borderRadius: theme.borderRadius.sm,
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
                            styles.message,
                            theme.typography.caption,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {message}
                    </Text>
                </View>
            </View>

            {Boolean(actionLabel && onAction) && (
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: getIconColor(),
                            borderRadius: theme.borderRadius.sm,
                        },
                    ]}
                    onPress={onAction}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    <Text
                        style={[
                            styles.actionText,
                            theme.typography.body,
                            { color: '#FFFFFF' },
                        ]}
                    >
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
    },
    message: {
        lineHeight: 20,
    },
    actionButton: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
    },
    actionText: {
        fontWeight: '600',
    },
});
