import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface UserListItemProps {
    name: string;
    role: string;
    avatar?: string;
    onPress?: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
    name,
    role,
    avatar,
    onPress,
}) => {
    const { theme } = useTheme();
    const [imageError, setImageError] = useState(false);

    const content = (
        <>
            <View style={styles.avatarContainer}>
                {avatar && !imageError ? (
                    <Image
                        source={{ uri: avatar }}
                        style={styles.avatar}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <View
                        style={[
                            styles.avatarPlaceholder,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    >
                        <Ionicons name="person" size={24} color="#FFFFFF" />
                    </View>
                )}
            </View>

            <View style={styles.textContainer}>
                <Text
                    style={[
                        styles.name,
                        theme.typography.body,
                        { color: theme.colors.text },
                    ]}
                >
                    {name}
                </Text>
                <Text
                    style={[
                        styles.role,
                        theme.typography.caption,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
            </View>

            {onPress && (
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                />
            )}
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                style={[
                    styles.container,
                    {
                        borderBottomColor: theme.colors.divider,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${name}, ${role}`}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    borderBottomColor: theme.colors.divider,
                },
            ]}
        >
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
        marginBottom: 2,
    },
    role: {
        textTransform: 'capitalize',
    },
});
