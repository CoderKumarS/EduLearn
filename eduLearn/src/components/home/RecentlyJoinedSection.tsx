import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { CourseCard } from '../common/CourseCard';
import { SectionHeader } from '../common/SectionHeader';
import { CourseCardSkeleton } from '../common/SkeletonLoader';
import { ErrorMessage } from '../common/ErrorMessage';
import { Course } from '../../types/course';
import { Ionicons } from '@expo/vector-icons';

interface RecentlyJoinedSectionProps {
    courses: (Course & {
        enrolledAt: string;
    })[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
}

export const RecentlyJoinedSection: React.FC<RecentlyJoinedSectionProps> = ({
    courses,
    isLoading,
    error,
    onRetry,
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const handleCoursePress = (courseId: number) => {
        navigation.navigate('CourseDetail', { courseId });
    };

    const handleBrowseCourses = () => {
        navigation.navigate('CourseList');
    };

    if (error) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Recently Joined"
                    icon="time-outline"
                />
                <ErrorMessage
                    message={error}
                    onRetry={onRetry}
                    compact
                />
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Recently Joined"
                    icon="time-outline"
                />
                <FlatList
                    data={[1, 2, 3]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => `recent-skeleton-${item}`}
                    renderItem={() => <CourseCardSkeleton />}
                />
            </View>
        );
    }

    if (!isLoading && courses.length === 0) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Recently Joined"
                    icon="time-outline"
                />
                <View style={styles.emptyState}>
                    <Ionicons
                        name="calendar-outline"
                        size={64}
                        color={theme.colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        No recent enrollments
                    </Text>
                    <Text
                        style={[
                            styles.emptyDescription,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Explore and enroll in courses to get started
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.browseButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={handleBrowseCourses}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.browseButtonText}>Browse Courses</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SectionHeader
                title="Recently Joined"
                icon="time-outline"
            />
            <FlatList
                data={courses}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CourseCard
                        course={item}
                        variant="default"
                        onPress={() => handleCoursePress(item.id)}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
