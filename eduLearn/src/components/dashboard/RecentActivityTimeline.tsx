import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
    id: number;
    type: string;
    title: string;
    timestamp: string;
}

interface RecentActivityTimelineProps {
    activities: Activity[];
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
    activities,
}) => {
    const { theme } = useTheme();

    const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            course_enrolled: 'add-circle',
            chapter_completed: 'checkmark-circle',
            quiz_completed: 'trophy',
            certificate_earned: 'ribbon',
        };
        return iconMap[type] || 'information-circle';
    };

    const getActivityColor = (type: string): string => {
        const colorMap: Record<string, string> = {
            course_enrolled: theme.colors.primary,
            chapter_completed: theme.colors.success,
            quiz_completed: theme.colors.warning,
            certificate_earned: theme.colors.accent,
        };
        return colorMap[type] || theme.colors.textSecondary;
    };

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderActivity = ({ item, index }: { item: Activity; index: number }) => {
        const isLast = index === activities.length - 1;
        const iconColor = getActivityColor(item.type);

        return (
            <View style={styles.activityItem}>
                <View style={styles.timelineContainer}>
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: iconColor + '20' },
                        ]}
                    >
                        <Ionicons
                            name={getActivityIcon(item.type)}
                            size={20}
                            color={iconColor}
                        />
                    </View>
                    {!isLast && (
                        <View
                            style={[
                                styles.timelineLine,
                                { backgroundColor: theme.colors.border },
                            ]}
                        />
                    )}
                </View>
                <View style={styles.activityContent}>
                    <Text
                        style={[
                            styles.activityTitle,
                            { color: theme.colors.text },
                        ]}
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>
                    <Text
                        style={[
                            styles.activityTime,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    if (activities.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.title,
                        theme.typography.h3,
                        { color: theme.colors.text },
                    ]}
                >
                    Recent Activity
                </Text>
                <View style={styles.emptyState}>
                    <Ionicons
                        name="time-outline"
                        size={48}
                        color={theme.colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        No recent activity
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <Text
                style={[
                    styles.title,
                    theme.typography.h3,
                    { color: theme.colors.text },
                ]}
            >
                Recent Activity
            </Text>
            <FlatList
                data={activities}
                renderItem={renderActivity}
                keyExtractor={(item, index) => `${item.id}-${item.type}-${index}`}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    title: {
        marginBottom: 16,
    },
    activityItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginTop: 4,
    },
    activityContent: {
        flex: 1,
        paddingTop: 4,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 14,
        marginTop: 12,
    },
});
