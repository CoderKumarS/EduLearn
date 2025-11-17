import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CourseCard } from '../common/CourseCard';
import { SectionHeader } from '../common/SectionHeader';
import { CourseCardSkeleton } from '../common/SkeletonLoader';
import { ErrorMessage } from '../common/ErrorMessage';
import { Course } from '../../types/course';

interface PopularCoursesSectionProps {
    courses: (Course & {
        enrollmentCount: number;
        rating: number;
        reviewCount: number;
    })[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
}

export const PopularCoursesSection: React.FC<PopularCoursesSectionProps> = ({
    courses,
    isLoading,
    error,
    onRetry,
}) => {
    const navigation = useNavigation<any>();

    const handleCoursePress = (courseId: number) => {
        navigation.navigate('CourseDetail', { courseId });
    };

    const handleViewAll = () => {
        // Navigate to Courses tab instead of pushing a new screen
        navigation.navigate('Courses');
    };

    if (error) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Popular Courses"
                    icon="trending-up"
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
                    title="Popular Courses"
                    icon="trending-up"
                />
                <FlatList
                    data={[1, 2, 3]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => `popular-skeleton-${item}`}
                    renderItem={() => <CourseCardSkeleton />}
                />
            </View>
        );
    }

    if (!isLoading && courses.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <SectionHeader
                title="Popular Courses"
                icon="trending-up"
                onViewAllPress={handleViewAll}
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
                        variant="featured"
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
});
