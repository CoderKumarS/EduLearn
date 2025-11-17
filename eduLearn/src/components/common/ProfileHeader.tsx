import React, { useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { User } from '../../types/auth';
import { getFullImageUrl } from '../../utils/imageUtils';

interface ProfileHeaderProps {
    user: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
}) => {
    const { theme } = useTheme();
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

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

    const profileImageUrl = getFullImageUrl(user.profile_image);

    return (
        <ThemedView variant="surface" style={styles.container}>
            <View style={styles.avatarContainer}>
                {profileImageUrl && !imageError ? (
                    <View style={styles.avatarImageContainer}>
                        <Image
                            source={{ uri: profileImageUrl }}
                            style={styles.avatarImage}
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={(error) => {
                                console.log('Profile image load error:', error.nativeEvent);
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />
                        {imageLoading && (
                            <View style={styles.avatarLoadingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                            </View>
                        )}
                    </View>
                ) : (
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
                )}
            </View>

            <ThemedText
                variant="default"
                size="xxl"
                weight="bold"
                style={styles.userName}
            >
                {user.name || user.username}
            </ThemedText>

            {user.name && user.username && (
                <ThemedText variant="secondary" size="sm" style={styles.username}>
                    @{user.username}
                </ThemedText>
            )}

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
    avatarImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    username: {
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
