import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { RecentCourse } from '../../types/instructor';

interface CourseRankingCardProps {
    course: RecentCourse;
    rank: number;
    metricType: 'enrollment' | 'rating';
    showInstructor?: boolean;
    onPress: () => void;
}

/**
 * Get ordinal suffix for ranking (1st, 2nd, 3rd, etc.)
 */
const getOrdinalSuffix = (rank: number): string => {
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) {
        return `${rank}st`;
    }
    if (j === 2 && k !== 12) {
        return `${rank}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${rank}rd`;
    }
    return `${rank}th`;
};

/**
 * Get badge color based on rank
 */
const getBadgeColor = (rank: number): string => {
    switch (rank) {
        case 1:
            return '#FFD700'; // Gold
        case 2:
            return '#C0C0C0'; // Silver
        case 3:
            return '#CD7F32'; // Bronze
        default:
            return '#6B7280'; // Gray
    }
};

export const CourseRankingCard: React.FC<CourseRankingCardProps> = ({
    course,
    rank,
    metricType,
    showInstructor = false,
    onPress,
}) => {
    const { theme } = useTheme();
    const badgeColor = getBadgeColor(rank);
    const ordinalRank = getOrdinalSuffix(rank);

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Ranking Badge */}
            <View style={[styles.rankBadge, { backgroundColor: badgeColor }]}>
                <ThemedText style={styles.rankText}>{ordinalRank}</ThemedText>
            </View>

            <View style={styles.content}>
                {/* Course Thumbnail */}
                <View style={styles.thumbnailContainer}>
                    {course.thumbnail ? (
                        <Image
                            source={{ uri: course.thumbnail }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="book" size={32} color={theme.colors.primary} />
                        </View>
                    )}
                </View>

                {/* Course Info */}
                <View style={styles.info}>
                    <ThemedText style={styles.title} numberOfLines={2}>
                        {course.title}
                    </ThemedText>
                    {course.description && (
                        <ThemedText variant="secondary" style={styles.description} numberOfLines={2}>
                            {course.description}
                        </ThemedText>
                    )}
                    {showInstructor && (
                        <View style={styles.instructorRow}>
                            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                            <ThemedText variant="secondary" style={styles.instructorName}>
                                {course.instructor_name}
                            </ThemedText>
                        </View>
                    )}

                    {/* Metric Display */}
                    <View style={styles.metricRow}>
                        {metricType === 'enrollment' ? (
                            <>
                                <View style={[styles.metricBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <Ionicons name="people" size={14} color={theme.colors.primary} />
                                    <ThemedText style={[styles.metricText, { color: theme.colors.primary }]}>
                                        {course.enrollment_count} students
                                    </ThemedText>
                                </View>
                                {course.average_rating && (
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={14} color="#F59E0B" />
                                        <ThemedText variant="secondary" style={styles.ratingText}>
                                            {course.average_rating.toFixed(1)}
                                        </ThemedText>
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                <View style={[styles.metricBadge, { backgroundColor: '#FEF3C7' }]}>
                                    <Ionicons name="star" size={14} color="#F59E0B" />
                                    <ThemedText style={[styles.metricText, { color: '#F59E0B' }]}>
                                        {course.average_rating?.toFixed(1) || 'N/A'} rating
                                    </ThemedText>
                                </View>
                                <View style={styles.enrollmentContainer}>
                                    <Ionicons name="people" size={14} color={theme.colors.textSecondary} />
                                    <ThemedText variant="secondary" style={styles.enrollmentText}>
                                        {course.enrollment_count}
                                    </ThemedText>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 1,
    },
    rankText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    content: {
        flexDirection: 'row',
        gap: 12,
    },
    thumbnailContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 6,
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    instructorName: {
        fontSize: 12,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    metricBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    metricText: {
        fontSize: 12,
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
    },
    enrollmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    enrollmentText: {
        fontSize: 12,
    },
});
