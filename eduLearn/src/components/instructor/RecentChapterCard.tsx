import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { RecentChapter } from '../../types/instructor';

interface RecentChapterCardProps {
    chapter: RecentChapter;
    onPress: () => void;
    onEdit: () => void;
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
};

export const RecentChapterCard: React.FC<RecentChapterCardProps> = ({
    chapter,
    onPress,
    onEdit,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.leftContent}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.textContent}>
                        <ThemedText style={styles.title} numberOfLines={1}>
                            {chapter.title}
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.courseName} numberOfLines={1}>
                            {chapter.course_title}
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.timestamp}>
                            {formatRelativeTime(chapter.created_at)}
                        </ThemedText>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContent: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    courseName: {
        fontSize: 13,
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 11,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
