import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { StudentActivity, ActivityType } from '../../types/instructor';

interface StudentActivityItemProps {
    activity: StudentActivity;
    onPress?: () => void;
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
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    } else {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks}w ago`;
    }
};

/**
 * Get icon name based on activity type
 */
const getActivityIcon = (activityType: ActivityType): keyof typeof Ionicons.glyphMap => {
    switch (activityType) {
        case 'enrollment':
            return 'person-add-outline';
        case 'chapter_completion':
            return 'checkmark-done-outline';
        case 'quiz_submission':
            return 'document-text-outline';
        default:
            return 'information-circle-outline';
    }
};

/**
 * Get activity description text
 */
const getActivityDescription = (activity: StudentActivity): string => {
    switch (activity.activity_type) {
        case 'enrollment':
            return `Enrolled in ${activity.course_name}`;
        case 'chapter_completion':
            return `Completed ${activity.details.chapter_title || 'a chapter'} in ${activity.course_name}`;
        case 'quiz_submission':
            const score = activity.details.score ? ` (${activity.details.score.toFixed(0)}%)` : '';
            return `Submitted ${activity.details.quiz_title || 'a quiz'} in ${activity.course_name}${score}`;
        default:
            return `Activity in ${activity.course_name}`;
    }
};

/**
 * Get icon background color based on activity type
 */
const getIconBackgroundColor = (activityType: ActivityType): string => {
    switch (activityType) {
        case 'enrollment':
            return '#3B82F6'; // Blue
        case 'chapter_completion':
            return '#10B981'; // Green
        case 'quiz_submission':
            return '#F59E0B'; // Orange
        default:
            return '#6B7280'; // Gray
    }
};

export const StudentActivityItem: React.FC<StudentActivityItemProps> = ({
    activity,
    onPress,
}) => {
    const { theme } = useTheme();
    const iconName = getActivityIcon(activity.activity_type);
    const iconBgColor = getIconBackgroundColor(activity.activity_type);
    const description = getActivityDescription(activity);

    const content = (
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
            <View style={styles.leftContent}>
                {/* Student Avatar or Initial */}
                <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                    {activity.student_avatar ? (
                        <ThemedText style={styles.avatarText}>
                            {activity.student_name.charAt(0).toUpperCase()}
                        </ThemedText>
                    ) : (
                        <ThemedText style={[styles.avatarText, { color: theme.colors.primary }]}>
                            {activity.student_name.charAt(0).toUpperCase()}
                        </ThemedText>
                    )}
                </View>

                {/* Activity Content */}
                <View style={styles.textContent}>
                    <View style={styles.headerRow}>
                        <ThemedText style={styles.studentName} numberOfLines={1}>
                            {activity.student_name}
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.timestamp}>
                            {formatRelativeTime(activity.timestamp)}
                        </ThemedText>
                    </View>
                    <ThemedText variant="secondary" style={styles.description} numberOfLines={2}>
                        {description}
                    </ThemedText>
                </View>
            </View>

            {/* Activity Type Icon */}
            <View style={[styles.activityIcon, { backgroundColor: iconBgColor }]}>
                <Ionicons name={iconName} size={16} color="#FFFFFF" />
            </View>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
    },
    textContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    timestamp: {
        fontSize: 11,
        marginLeft: 8,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
