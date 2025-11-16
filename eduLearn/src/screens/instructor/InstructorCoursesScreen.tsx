import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { InstructorCourseCard } from '../../components/instructor/InstructorCourseCard';
import { instructorService } from '../../services/instructorService';
import { CourseWithEnrollment } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';
import { LoadingScreen } from '../../components/common/LoadingScreen';

interface InstructorCoursesScreenProps {
    onNavigateToManageCourse: (courseId: number) => void;
    onNavigateToCreateCourse: () => void;
}

export const InstructorCoursesScreen: React.FC<InstructorCoursesScreenProps> = ({
    onNavigateToManageCourse,
    onNavigateToCreateCourse,
}) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0 });

    useEffect(() => {
        loadInstructorData();
    }, []);

    const loadInstructorData = async () => {
        try {
            const data = await instructorService.getInstructorStats();
            setCourses(data.courses);
            setStats({
                totalCourses: data.total_courses,
                totalStudents: data.total_students,
            });
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadInstructorData();
    };

    const handleDeleteCourse = (courseId: number) => {
        Alert.alert(
            'Delete Course',
            'Are you sure you want to delete this course? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // TODO: Implement delete course API call
                            Alert.alert('Success', 'Course deleted successfully');
                            loadInstructorData();
                        } catch (error) {
                            const apiError = handleApiError(error);
                            Alert.alert('Error', apiError.message);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingScreen message="Loading your courses..." />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <View>
                    <ThemedText style={styles.headerTitle}>My Courses</ThemedText>
                    <ThemedText variant="secondary" style={styles.headerSubtitle}>
                        Manage your courses and content
                    </ThemedText>
                </View>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                    onPress={onNavigateToCreateCourse}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="book-outline" size={32} color={theme.colors.primary} />
                    <ThemedText style={styles.statNumber}>{stats.totalCourses}</ThemedText>
                    <ThemedText variant="secondary" style={styles.statLabel}>
                        Total Courses
                    </ThemedText>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="people-outline" size={32} color={theme.colors.primary} />
                    <ThemedText style={styles.statNumber}>{stats.totalStudents}</ThemedText>
                    <ThemedText variant="secondary" style={styles.statLabel}>
                        Total Students
                    </ThemedText>
                </View>
            </View>

            {/* Courses List */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <ThemedView style={styles.content}>
                    {courses.length === 0 ? (
                        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
                            <Ionicons name="book-outline" size={64} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.emptyTitle}>No Courses Yet</ThemedText>
                            <ThemedText variant="secondary" style={styles.emptyText}>
                                Create your first course to start teaching
                            </ThemedText>
                            <Button
                                title="Create Course"
                                onPress={onNavigateToCreateCourse}
                                style={styles.emptyButton}
                            />
                        </View>
                    ) : (
                        <View style={styles.coursesList}>
                            {courses.map((course) => (
                                <InstructorCourseCard
                                    key={course.id}
                                    course={course}
                                    onPress={() => onNavigateToManageCourse(course.id)}
                                    onEdit={() => onNavigateToManageCourse(course.id)}
                                    onDelete={() => handleDeleteCourse(course.id)}
                                />
                            ))}
                        </View>
                    )}
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    createButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    emptyState: {
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    emptyButton: {
        minWidth: 150,
    },
    coursesList: {
        gap: 16,
    },
});
