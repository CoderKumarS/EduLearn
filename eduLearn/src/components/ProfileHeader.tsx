import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types/auth';

interface ProfileHeaderProps {
    user: User;
    onEditPress: () => void;
    isEditing: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    onEditPress,
    isEditing,
}) => {
    const { theme } = useTheme();

    const getInitials = () => {
        if (user.name) {
            return user.name.charAt(0).toUpperCase();
        }
        if (user.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const getRoleBadgeColor = () => {
        switch (user.role) {
            case 'instructor':
                return '#10B981';
            case 'admin':
                return '#EF4444';
            default:
                return theme.colors.primary;
        }
    };

    const getRoleLabel = () => {
        if (!user.role) return 'Student';
        return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    };

    return (
        <ThemedView variant="surface" style={styles.container}>
            <View style={styles.header}>
                <View style={{ flex: 1 }} />
                {!isEditing && (
                    <TouchableOpacity
                        onPress={onEditPress}
                        style={styles.editButton}
                        accessibilityRole="button"
                        accessibilityLabel="Edit profile"
                        accessibilityHint="Tap to edit your profile information"
                    >
                        <ThemedText variant="primary" size="md" weight="semibold">
                            Edit
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.avatarContainer}>
                <View
                    style={[
                        styles.avatar,
                        { backgroundColor: theme.colors.primary },
                    ]}
                >
                    <ThemedText style={styles.avatarText}>
                        {getInitials()}
                    </ThemedText>
                </View>
            </View>

            <ThemedText
                variant="default"
                size="xxl"
                weight="bold"
                style={styles.userName}
            >
                {user.name || user.username}
            </ThemedText>

            <ThemedText variant="secondary" size="md" style={styles.email}>
                {user.email}
            </ThemedText>

            <View
                style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleBadgeColor() + '20' },
                ]}
            >
                <ThemedText
                    size="sm"
                    weight="semibold"
                    style={[styles.roleText, { color: getRoleBadgeColor() }]}
                >
                    {getRoleLabel()}
                </ThemedText>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    editButton: {
        padding: 4,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        textAlign: 'center',
        marginBottom: 4,
    },
    email: {
        textAlign: 'center',
        marginBottom: 12,
    },
    roleBadge: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        textTransform: 'capitalize',
    },
});
