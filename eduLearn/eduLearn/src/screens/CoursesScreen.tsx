import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    enrolled: boolean;
}

const CoursesScreen: React.FC = () => {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    // Mock course data
    const courses: Course[] = [
        {
            id: '1',
            title: 'Introduction to React Native',
            description: 'Learn the basics of building mobile apps with React Native',
            instructor: 'John Doe',
            duration: '8 weeks',
            level: 'Beginner',
            enrolled: Boolean(true),
        },
        {
            id: '2',
            title: 'Advanced TypeScript',
            description: 'Master advanced TypeScript patterns and best practices',
            instructor: 'Jane Smith',
            duration: '6 weeks',
            level: 'Advanced',
            enrolled: Boolean(true),
        },
        {
            id: '3',
            title: 'Mobile UI/UX Design',
            description: 'Create beautiful and intuitive mobile interfaces',
            instructor: 'Mike Johnson',
            duration: '4 weeks',
            level: 'Intermediate',
            enrolled: Boolean(false),
        },
        {
            id: '4',
            title: 'State Management with Redux',
            description: 'Learn to manage complex application state effectively',
            instructor: 'Sarah Williams',
            duration: '5 weeks',
            level: 'Intermediate',
            enrolled: Boolean(false),
        },
    ];

    const filteredCourses = courses.filter(course => {
        if (selectedFilter === 'enrolled') return Boolean(course.enrolled);
        if (selectedFilter === 'available') return Boolean(!course.enrolled);
        return Boolean(true);
    });

    const renderCourseCard = (course: Course) => (
        <ThemedView key={course.id} variant="surface" style={styles.courseCard}>
            <ThemedView style={styles.courseHeader}>
                <ThemedText variant="default" size="lg" weight="bold">
                    {course.title}
                </ThemedText>
                {Boolean(course.enrolled) && (
                    <ThemedView style={[styles.badge, { backgroundColor: theme.colors.success }]}>
                        <ThemedText size="xs" weight="semibold" style={styles.badgeText}>
                            Enrolled
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView>

            <ThemedText variant="secondary" size="sm" style={styles.courseDescription}>
                {course.description}
            </ThemedText>

            <ThemedView style={styles.courseDetails}>
                <ThemedView style={styles.detailItem}>
                    <ThemedText variant="secondary" size="xs">Instructor</ThemedText>
                    <ThemedText variant="default" size="sm" weight="semibold">
                        {course.instructor}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailItem}>
                    <ThemedText variant="secondary" size="xs">Duration</ThemedText>
                    <ThemedText variant="default" size="sm" weight="semibold">
                        {course.duration}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailItem}>
                    <ThemedText variant="secondary" size="xs">Level</ThemedText>
                    <ThemedText variant="default" size="sm" weight="semibold">
                        {course.level}
                    </ThemedText>
                </ThemedView>
            </ThemedView>

            <TouchableOpacity
                style={[
                    styles.actionButton,
                    { backgroundColor: Boolean(course.enrolled) ? theme.colors.primary : theme.colors.success }
                ]}
                disabled={Boolean(!isAuthenticated)}
            >
                <ThemedText size="md" weight="semibold" style={styles.actionButtonText}>
                    {Boolean(course.enrolled) ? 'Continue Learning' : 'Enroll Now'}
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );

    return (
        <ScrollView style={styles.scrollView}>
            <ThemedView variant="default" style={styles.container}>
                {/* Header */}
                <ThemedView variant="default" style={styles.header}>
                    <ThemedText variant="default" size="xxl" weight="bold">
                        Courses
                    </ThemedText>
                    <ThemedText variant="secondary" size="md">
                        Explore and enroll in courses
                    </ThemedText>
                </ThemedView>

                {/* Filter Buttons */}
                <ThemedView variant="default" style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            { backgroundColor: selectedFilter === 'all' ? theme.colors.primary : theme.colors.surface }
                        ]}
                        onPress={() => setSelectedFilter('all')}
                    >
                        <ThemedText
                            size="sm"
                            weight="semibold"
                            style={[
                                styles.filterButtonText,
                                { color: selectedFilter === 'all' ? '#FFFFFF' : theme.colors.text }
                            ]}
                        >
                            All Courses
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            { backgroundColor: selectedFilter === 'enrolled' ? theme.colors.primary : theme.colors.surface }
                        ]}
                        onPress={() => setSelectedFilter('enrolled')}
                    >
                        <ThemedText
                            size="sm"
                            weight="semibold"
                            style={[
                                styles.filterButtonText,
                                { color: selectedFilter === 'enrolled' ? '#FFFFFF' : theme.colors.text }
                            ]}
                        >
                            My Courses
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            { backgroundColor: selectedFilter === 'available' ? theme.colors.primary : theme.colors.surface }
                        ]}
                        onPress={() => setSelectedFilter('available')}
                    >
                        <ThemedText
                            size="sm"
                            weight="semibold"
                            style={[
                                styles.filterButtonText,
                                { color: selectedFilter === 'available' ? '#FFFFFF' : theme.colors.text }
                            ]}
                        >
                            Available
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* Course List */}
                <ThemedView variant="default" style={styles.courseList}>
                    {filteredCourses.map(renderCourseCard)}
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonText: {
        // Color set dynamically
    },
    courseList: {
        gap: 16,
    },
    courseCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#FFFFFF',
    },
    courseDescription: {
        marginBottom: 16,
        lineHeight: 20,
    },
    courseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
    },
    actionButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
    },
});

export default CoursesScreen;
