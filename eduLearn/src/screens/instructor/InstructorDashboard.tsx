import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { courseService } from '../../services/courseService';
import { Course, Enrollment } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { getCourseImageUrl } from '../../utils/imageUtils';

interface InstructorDashboardProps {
    onNavigateBack: () => void;
    onNavigateToCourse: (courseId: number) => void;
    onCreateCourse: () => void;
}

interface CourseWithStatus extends Omit<Course, 'status'> {
    status?: 'Published' | 'Draft' | 'Archived';
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
    onNavigateBack,
    onNavigateToCourse,
    onCreateCourse,
}) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [courses, setCourses] = useState<CourseWithStatus[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            // Fetch instructor's courses using the new endpoint
            const coursesData = await courseService.getInstructorCourses(user!.id);
            const enrollmentsData = await courseService.getEnrollments();

            // Add mock status for display (since backend doesn't have it yet)
            const coursesWithStatus: CourseWithStatus[] = coursesData.map((course, index) => ({
                ...course,
                status: index % 3 === 0 ? 'Published' : index % 3 === 1 ? 'Draft' : 'Archived',
            }));

            setCourses(coursesWithStatus);
            setEnrollments(enrollmentsData);
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Failed to load instructor data:', apiError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getTotalStudents = () => {
        const courseIds = courses.map(course => course.id);
        return enrollments.filter(enrollment =>
            courseIds.includes(enrollment.course.id)
        ).length;
    };

    const getAverageCourseRating = () => {
        const coursesWithRating = courses.filter(c => c.rating);
        if (coursesWithRating.length === 0) return 4.8;
        const sum = coursesWithRating.reduce((acc, c) => acc + (c.rating || 0), 0);
        return (sum / coursesWithRating.length).toFixed(1);
    };

    const getEnrollmentsForCourse = (courseId: string) => {
        return enrollments.filter(enrollment => enrollment.course.id === courseId).length;
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Published':
                return '#10B981';
            case 'Draft':
                return '#F59E0B';
            case 'Archived':
                return '#6B7280';
            default:
                return theme.colors.textSecondary;
        }
    };

    const renderCourseCard = (course: CourseWithStatus) => {
        const enrollmentCount = getEnrollmentsForCourse(course.id);

        return (
            <TouchableOpacity
                key={course.id}
                style={[styles.courseListItem, { backgroundColor: theme.colors.card }]}
                onPress={() => onNavigateToCourse(course.id)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: getCourseImageUrl(course.thumbnail_image, course.title, course.id) }}
                    style={styles.courseImage}
                    resizeMode="cover"
                />
                <View style={styles.courseInfo}>
                    <ThemedText style={styles.courseListTitle} numberOfLines={2}>
                        {course.title}
                    </ThemedText>
                    <View style={styles.courseStatusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.status) + '20' }]}>
                            <ThemedText style={[styles.statusText, { color: getStatusColor(course.status) }]}>
                                ● {course.status || 'Published'}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText variant="secondary" style={styles.enrollmentText}>
                        {enrollmentCount} Students Enrolled
                    </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    const recentActivities = [
        {
            id: '1',
            name: 'Alice Johnson',
            action: 'completed',
            course: 'Introduction to Python',
            time: '2 hours ago',
        },
        {
            id: '2',
            name: 'Bob Williams',
            action: 'attempted',
            course: 'AI Ethics Quiz',
            time: 'Yesterday',
        },
        {
            id: '3',
            name: 'Charlie Davis',
            action: 'started',
            course: 'Advanced SQL Course',
            time: '2 days ago',
        },
    ];

    if (loading) {
        return <LoadingScreen message="Loading dashboard..." />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.headerTitle}>Instructor Dashboard</ThemedText>
                        <TouchableOpacity onPress={onCreateCourse} style={styles.addIconButton}>
                            <Ionicons name="add-outline" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Welcome Message */}
                    <ThemedText style={styles.welcomeText}>
                        Welcome back, {user?.username || 'Professor Smith'}!
                    </ThemedText>

                    {/* Statistics */}
                    <ThemedText style={styles.sectionLabel}>Your Statistics</ThemedText>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                            <Ionicons name="school-outline" size={32} color={theme.colors.primary} />
                            <ThemedText style={styles.statNumber}>
                                {getTotalStudents().toLocaleString()}
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.statLabel}>
                                Total Students
                            </ThemedText>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                            <Ionicons name="star-outline" size={32} color={theme.colors.primary} />
                            <ThemedText style={styles.statNumber}>{getAverageCourseRating()}</ThemedText>
                            <ThemedText variant="secondary" style={styles.statLabel}>
                                Avg. Course Rating
                            </ThemedText>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <ThemedText style={styles.sectionLabel}>Quick Actions</ThemedText>
                    <TouchableOpacity
                        style={[styles.createCourseButton, { backgroundColor: theme.colors.primary }]}
                        onPress={onCreateCourse}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.createCourseButtonText}>Create New Course</ThemedText>
                    </TouchableOpacity>

                    {/* Courses Created */}
                    <ThemedText style={styles.sectionLabel}>Courses Created</ThemedText>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ThemedText>Loading your courses...</ThemedText>
                        </View>
                    ) : courses.length === 0 ? (
                        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}>
                            <ThemedText style={styles.emptyText}>
                                You haven't created any courses yet.
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.emptySubtext}>
                                Create your first course to start teaching!
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.coursesList}>
                            {courses.map(renderCourseCard)}
                        </View>
                    )}

                    {/* Recent Activity */}
                    <ThemedText style={styles.sectionLabel}>Recent Activity</ThemedText>
                    <View style={styles.activityList}>
                        {recentActivities.map((activity) => (
                            <View key={activity.id} style={styles.activityItem}>
                                <View style={[styles.activityAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <ThemedText style={[styles.activityAvatarText, { color: theme.colors.primary }]}>
                                        {activity.name.charAt(0)}
                                    </ThemedText>
                                </View>
                                <View style={styles.activityInfo}>
                                    <ThemedText style={styles.activityText}>
                                        {activity.name} {activity.action} "{activity.course}"
                                    </ThemedText>
                                    <ThemedText variant="secondary" style={styles.activityTime}>
                                        {activity.time}
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                    </View>
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addIconButton: {
        padding: 4,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    createCourseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 24,
        gap: 8,
    },
    createCourseButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 13,
        textAlign: 'center',
    },
    coursesList: {
        marginBottom: 24,
    },
    courseListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    courseImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#E5E7EB',
    },
    courseInfo: {
        flex: 1,
    },
    courseListTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    courseStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    enrollmentText: {
        fontSize: 12,
    },
    activityList: {
        marginBottom: 24,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    activityAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityAvatarText: {
        fontSize: 16,
        fontWeight: '600',
    },
    activityInfo: {
        flex: 1,
    },
    activityText: {
        fontSize: 14,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
    },
});
