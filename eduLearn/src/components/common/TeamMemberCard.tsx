import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface TeamMemberCardProps {
    name: string;
    title: string;
    bio: string;
    photo: string;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
    name,
    title,
    bio,
    photo,
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.borderRadius.lg,
                    shadowColor: theme.colors.shadow,
                },
            ]}
        >
            <View style={styles.photoContainer}>
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.photo} />
                ) : (
                    <View
                        style={[
                            styles.photoPlaceholder,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    >
                        <Ionicons name="person" size={48} color="#FFFFFF" />
                    </View>
                )}
            </View>

            <Text
                style={[
                    styles.name,
                    theme.typography.h3,
                    { color: theme.colors.text },
                ]}
            >
                {name}
            </Text>

            <Text
                style={[
                    styles.title,
                    theme.typography.body,
                    { color: theme.colors.primary },
                ]}
            >
                {title}
            </Text>

            <Text
                style={[
                    styles.bio,
                    theme.typography.caption,
                    { color: theme.colors.textSecondary },
                ]}
                numberOfLines={4}
            >
                {bio}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    photoContainer: {
        marginBottom: 12,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    photoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        textAlign: 'center',
        marginBottom: 4,
    },
    title: {
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 8,
    },
    bio: {
        textAlign: 'center',
        lineHeight: 20,
    },
});
