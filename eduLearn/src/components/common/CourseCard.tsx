import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { Course } from '../../types/course';
import { Ionicons } from '@expo/vector-icons';
import { getFullImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

interface CourseCardProps {
    course: Course & {
        progress?: number;
        enrollmentCount?: number;
        rating?: number;
        reviewCount?: number;
        enrolledAt?: string;
        lastAccessedChapter?: number;
        nextChapter?: {
            id: number;
            title: string;
        };
    };
    variant?: 'default' | 'compact' | 'featured';
    onPress: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
    course,
    variant = 'default',
    onPress,
}) => {
    const { theme } = useTheme();

    const renderProgressBar = () => {
        // Only show progress bar if progress data exists (for enrolled courses)
        if (course.progress === undefined || course.progress === null) return null;

        const progressValue = Math.max(0, Math.min(100, course.progress));

        return (
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${progressValue}%`,
                                backgroundColor: theme.colors.primary,
                                minWidth: progressValue > 0 ? 2 : 0, // Show at least 2px if there's any progress
                            },
                        ]}
                    />
                </View>
                <Text
                    style={[
                        styles.progressText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {Math.round(progressValue)}%
                </Text>
            </View>
        );
    };

    const renderRating = () => {
        const rating = course.rating || course.average_rating || 0;
        const reviewCount = course.reviewCount || course.ratings_count || 0;

        if (rating === 0) return null;

        return (
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFA726" />
                <Text
                    style={[
                        styles.ratingText,
                        { color: theme.colors.text },
                    ]}
                >
                    {rating.toFixed(1)}
                </Text>
                <Text
                    style={[
                        styles.reviewCount,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    ({reviewCount})
                </Text>
            </View>
        );
    };

    const renderEnrollmentCount = () => {
        const count = course.enrollmentCount || course.enrollment_count || 0;

        if (count === 0) return null;

        return (
            <View style={styles.enrollmentContainer}>
                <Ionicons
                    name="people-outline"
                    size={14}
                    color={theme.colors.textSecondary}
                />
                <Text
                    style={[
                        styles.enrollmentText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {count.toLocaleString()} enrolled
                </Text>
            </View>
        );
    };

    if (variant === 'compact') {
        const renderCompactThumbnail = () => {
            const imageUrl = getFullImageUrl(course.thumbnail_image);
            if (imageUrl) {
                return (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.compactThumbnail}
                    />
                );
            }

            const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#F97316'];
            const colorIndex = course.id % colors.length;
            const gradientColor = colors[colorIndex];

            return (
                <LinearGradient
                    colors={[gradientColor, `${gradientColor}CC`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.compactThumbnail}
                >
                    <Ionicons name="book" size={32} color="#FFFFFF" />
                </LinearGradient>
            );
        };

        return (
            <TouchableOpacity
                style={[
                    styles.compactCard,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {renderCompactThumbnail()}
                <View style={styles.compactContent}>
                    <Text
                        style={[
                            styles.compactTitle,
                            { color: theme.colors.text },
                        ]}
                        numberOfLines={2}
                    >
                        {course.title}
                    </Text>
                    <Text
                        style={[
                            styles.compactInstructor,
                            { color: theme.colors.textSecondary },
                        ]}
                        numberOfLines={1}
                    >
                        {course.instructor?.username || course.instructor_name}
                    </Text>
                    {renderProgressBar()}
                </View>
            </TouchableOpacity>
        );
    }

    if (variant === 'featured') {
        const renderFeaturedThumbnail = () => {
            const imageUrl = getFullImageUrl(course.thumbnail_image);
            if (imageUrl) {
                return (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.featuredThumbnail}
                    />
                );
            }

            const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#F97316'];
            const colorIndex = course.id % colors.length;
            const gradientColor = colors[colorIndex];

            return (
                <LinearGradient
                    colors={[gradientColor, `${gradientColor}CC`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.featuredThumbnail}
                >
                    <Ionicons name="book" size={64} color="#FFFFFF" />
                </LinearGradient>
            );
        };

        return (
            <TouchableOpacity
                style={[
                    styles.featuredCard,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {renderFeaturedThumbnail()}
                <View style={styles.featuredContent}>
                    <View style={styles.featuredHeader}>
                        <Text
                            style={[
                                styles.featuredTitle,
                                { color: theme.colors.text },
                            ]}
                            numberOfLines={2}
                        >
                            {course.title}
                        </Text>
                        <Text
                            style={[
                                styles.featuredInstructor,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            {course.instructor?.username || course.instructor_name}
                        </Text>
                    </View>
                    <View style={styles.featuredFooter}>
                        {renderRating()}
                        {renderEnrollmentCount()}
                    </View>
                    {renderProgressBar()}
                </View>
            </TouchableOpacity>
        );
    }

    // Default variant
    const renderThumbnail = () => {
        const imageUrl = getFullImageUrl(course.thumbnail_image);
        if (imageUrl) {
            return (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.defaultThumbnail}
                />
            );
        }

        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#F97316'];
        const colorIndex = course.id % colors.length;
        const gradientColor = colors[colorIndex];

        return (
            <LinearGradient
                colors={[gradientColor, `${gradientColor}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.defaultThumbnail}
            >
                <Ionicons name="book" size={48} color="#FFFFFF" />
            </LinearGradient>
        );
    };

    return (
        <TouchableOpacity
            style={[
                styles.defaultCard,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {renderThumbnail()}
            <View style={styles.defaultContent}>
                <Text
                    style={[
                        styles.defaultTitle,
                        { color: theme.colors.text },
                    ]}
                    numberOfLines={2}
                >
                    {course.title}
                </Text>
                <Text
                    style={[
                        styles.defaultInstructor,
                        { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {course.instructor?.username || course.instructor_name}
                </Text>
                <View style={styles.defaultFooter}>
                    {renderRating()}
                    {renderEnrollmentCount()}
                </View>
                {renderProgressBar()}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Default variant styles
    defaultCard: {
        width: width * 0.7,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        marginRight: 16,
    },
    defaultThumbnail: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultContent: {
        padding: 12,
    },
    defaultTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    defaultInstructor: {
        fontSize: 14,
        marginBottom: 8,
    },
    defaultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },

    // Compact variant styles
    compactCard: {
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 12,
    },
    compactThumbnail: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    compactContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    compactTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    compactInstructor: {
        fontSize: 12,
        marginBottom: 8,
    },

    // Featured variant styles
    featuredCard: {
        width: width * 0.85,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginRight: 16,
    },
    featuredThumbnail: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredContent: {
        padding: 16,
    },
    featuredHeader: {
        marginBottom: 12,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    featuredInstructor: {
        fontSize: 14,
    },
    featuredFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
    },

    // Common styles
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 35,
        textAlign: 'right',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 12,
    },
    enrollmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    enrollmentText: {
        fontSize: 12,
    },
});
