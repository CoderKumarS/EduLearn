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

interface ContinueLearningSectionProps {
    courses: (Course & {
        progress: number;
        lastAccessedChapter?: number;
        nextChapter?: {
            id: number;
            title: string;
        };
    })[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
}

export const ContinueLearningSection: React.FC<ContinueLearningSectionProps> = ({
    courses,
    isLoading,
    error,
    onRetry,
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const handleCoursePress = (course: any) => {
        if (course.nextChapter) {
            // Navigate to the next chapter
            navigation.navigate('ChapterDetail', {
                courseId: course.id,
                chapterId: course.nextChapter.id,
            });
        } else {
            // Navigate to course detail
            navigation.navigate('CourseDetail', { courseId: course.id });
        }
    };

    const handleBrowseCourses = () => {
        navigation.navigate('CourseList');
    };

    if (error) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Continue Learning"
                    icon="play-circle-outline"
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
                    title="Continue Learning"
                    icon="play-circle-outline"
                />
                <FlatList
                    data={[1, 2, 3]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => `continue-skeleton-${item}`}
                    renderItem={() => <CourseCardSkeleton />}
                />
            </View>
        );
    }

    if (!isLoading && courses.length === 0) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Continue Learning"
                    icon="play-circle-outline"
                />
                <View style={styles.emptyState}>
                    <Ionicons
                        name="book-outline"
                        size={64}
                        color={theme.colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        No courses in progress
                    </Text>
                    <Text
                        style={[
                            styles.emptyDescription,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Start learning by enrolling in a course
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
                title="Continue Learning"
                icon="play-circle-outline"
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
                        onPress={() => handleCoursePress(item)}
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
