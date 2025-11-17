import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedText } from '../common/ThemedText';
import { LoadingScreen } from '../common/LoadingScreen';
import { RecentChapterCard } from './RecentChapterCard';
import { StudentActivityItem } from './StudentActivityItem';
import { CourseRankingCard } from './CourseRankingCard';
import { instructorService } from '../../services/instructorService';
import { InstructorDashboardData } from '../../types/instructor';
import { handleApiError } from '../../utils/errorHandler';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const InstructorHomeContent: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<InstructorDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await instructorService.getInstructorDashboard();
            setDashboardData(data);
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Failed to load dashboard data:', apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadDashboardData();
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading your dashboard..." />;
    }

    if (!dashboardData) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <ThemedText style={styles.errorText}>Failed to load dashboard</ThemedText>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={theme.colors.primary}
                />
            }
        >
            {/* Hero Section */}
            <View style={[styles.heroSection, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.welcomeHeader}>
                    <View>
                        <ThemedText style={[styles.welcomeText, { color: '#FFFFFFCC' }]}>
                            Welcome back,
                        </ThemedText>
                        <ThemedText style={[styles.heroTitle, { color: '#FFFFFF' }]}>
                            {user?.username}!
                        </ThemedText>
                    </View>
                    {user?.profile_image && (
                        <Image
                            source={{ uri: user.profile_image }}
                            style={styles.profileImage}
                        />
                    )}
                </View>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsSection}>
                <View style={[styles.statCard, { backgroundColor: '#3B82F6' }]}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                    </View>
                    <ThemedText style={[styles.statValue, { color: '#FFFFFF' }]}>
                        {dashboardData.stats.total_courses}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: '#FFFFFFCC' }]}>
                        Courses Created
                    </ThemedText>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="people-outline" size={24} color="#FFFFFF" />
                    </View>
                    <ThemedText style={[styles.statValue, { color: '#FFFFFF' }]}>
                        {dashboardData.stats.total_students}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: '#FFFFFFCC' }]}>
                        Students Enrolled
                    </ThemedText>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="layers-outline" size={24} color="#FFFFFF" />
                    </View>
                    <ThemedText style={[styles.statValue, { color: '#FFFFFF' }]}>
                        {dashboardData.stats.total_chapters}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: '#FFFFFFCC' }]}>
                        Chapters Created
                    </ThemedText>
                </View>
            </View>

            {/* Recently Created Courses */}
            {dashboardData.recent_courses.length > 0 && (
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Recently Created Courses</ThemedText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {dashboardData.recent_courses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                            >
                                {course.thumbnail ? (
                                    <Image source={{ uri: course.thumbnail }} style={styles.courseThumbnail} />
                                ) : (
                                    <View style={[styles.courseThumbnailPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Ionicons name="book" size={32} color={theme.colors.primary} />
                                    </View>
                                )}
                                <View style={styles.courseInfo}>
                                    <ThemedText style={styles.courseTitle} numberOfLines={2}>
                                        {course.title}
                                    </ThemedText>
                                    <View style={styles.courseStats}>
                                        <View style={styles.courseStat}>
                                            <Ionicons name="people" size={14} color={theme.colors.textSecondary} />
                                            <ThemedText variant="secondary" style={styles.courseStatText}>
                                                {course.enrollment_count}
                                            </ThemedText>
                                        </View>
                                        {course.average_rating && (
                                            <View style={styles.courseStat}>
                                                <Ionicons name="star" size={14} color="#F59E0B" />
                                                <ThemedText variant="secondary" style={styles.courseStatText}>
                                                    {course.average_rating.toFixed(1)}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Recently Created Chapters */}
            {dashboardData.recent_chapters.length > 0 && (
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Recently Created Chapters</ThemedText>
                    {dashboardData.recent_chapters.map((chapter) => (
                        <RecentChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            onPress={() => {
                                // Navigate to chapter detail or course detail
                                navigation.navigate('CourseDetail', { courseId: chapter.course_id });
                            }}
                            onEdit={() => {
                                // Navigate to edit chapter screen
                                navigation.navigate('ManageCourse', { courseId: chapter.course_id });
                            }}
                        />
                    ))}
                </View>
            )}

            {/* Recent Student Activity */}
            {dashboardData.recent_activities.length > 0 && (
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Recent Student Activity</ThemedText>
                    {dashboardData.recent_activities.map((activity) => (
                        <StudentActivityItem
                            key={activity.id}
                            activity={activity}
                            onPress={() => {
                                navigation.navigate('CourseDetail', { courseId: activity.course_id });
                            }}
                        />
                    ))}
                </View>
            )}

            {/* My Top Performing Courses */}
            {(dashboardData.my_top_courses.by_enrollment.length > 0 ||
                dashboardData.my_top_courses.by_rating.length > 0) && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>My Top Performing Courses</ThemedText>

                        {dashboardData.my_top_courses.by_enrollment.length > 0 && (
                            <View style={styles.subsection}>
                                <ThemedText style={styles.subsectionTitle}>By Enrollment</ThemedText>
                                {dashboardData.my_top_courses.by_enrollment.map((course, index) => (
                                    <CourseRankingCard
                                        key={course.id}
                                        course={course}
                                        rank={index + 1}
                                        metricType="enrollment"
                                        showInstructor={false}
                                        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    />
                                ))}
                            </View>
                        )}

                        {dashboardData.my_top_courses.by_rating.length > 0 && (
                            <View style={styles.subsection}>
                                <ThemedText style={styles.subsectionTitle}>By Rating</ThemedText>
                                {dashboardData.my_top_courses.by_rating.map((course, index) => (
                                    <CourseRankingCard
                                        key={course.id}
                                        course={course}
                                        rank={index + 1}
                                        metricType="rating"
                                        showInstructor={false}
                                        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

            {/* Other Instructors' Courses */}
            {dashboardData.other_instructors_courses.length > 0 && (
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Other Instructors' Courses</ThemedText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {dashboardData.other_instructors_courses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                            >
                                {course.thumbnail ? (
                                    <Image source={{ uri: course.thumbnail }} style={styles.courseThumbnail} />
                                ) : (
                                    <View style={[styles.courseThumbnailPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Ionicons name="book" size={32} color={theme.colors.primary} />
                                    </View>
                                )}
                                <View style={styles.courseInfo}>
                                    <ThemedText style={styles.courseTitle} numberOfLines={2}>
                                        {course.title}
                                    </ThemedText>
                                    <View style={styles.instructorRow}>
                                        <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
                                        <ThemedText variant="secondary" style={styles.instructorText} numberOfLines={1}>
                                            {course.instructor_name}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.courseStats}>
                                        <View style={styles.courseStat}>
                                            <Ionicons name="people" size={14} color={theme.colors.textSecondary} />
                                            <ThemedText variant="secondary" style={styles.courseStatText}>
                                                {course.enrollment_count}
                                            </ThemedText>
                                        </View>
                                        {course.average_rating && (
                                            <View style={styles.courseStat}>
                                                <Ionicons name="star" size={14} color="#F59E0B" />
                                                <ThemedText variant="secondary" style={styles.courseStatText}>
                                                    {course.average_rating.toFixed(1)}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Platform Top Ranking Courses */}
            {(dashboardData.platform_top_courses.by_enrollment.length > 0 ||
                dashboardData.platform_top_courses.by_rating.length > 0) && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Platform Top Ranking Courses</ThemedText>

                        {dashboardData.platform_top_courses.by_enrollment.length > 0 && (
                            <View style={styles.subsection}>
                                <ThemedText style={styles.subsectionTitle}>By Enrollment</ThemedText>
                                {dashboardData.platform_top_courses.by_enrollment.map((course, index) => (
                                    <CourseRankingCard
                                        key={course.id}
                                        course={course}
                                        rank={index + 1}
                                        metricType="enrollment"
                                        showInstructor={true}
                                        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    />
                                ))}
                            </View>
                        )}

                        {dashboardData.platform_top_courses.by_rating.length > 0 && (
                            <View style={styles.subsection}>
                                <ThemedText style={styles.subsectionTitle}>By Rating</ThemedText>
                                {dashboardData.platform_top_courses.by_rating.map((course, index) => (
                                    <CourseRankingCard
                                        key={course.id}
                                        course={course}
                                        rank={index + 1}
                                        metricType="rating"
                                        showInstructor={true}
                                        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
    },
    heroSection: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    statsSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
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
    statIconContainer: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    subsection: {
        marginBottom: 20,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    horizontalScroll: {
        paddingRight: 20,
        paddingBottom: 5
    },
    courseCard: {
        width: 200,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    courseThumbnail: {
        width: '100%',
        height: 120,
    },
    courseThumbnailPlaceholder: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: {
        padding: 12,
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    instructorText: {
        fontSize: 12,
        flex: 1,
    },
    courseStats: {
        flexDirection: 'row',
        gap: 12,
    },
    courseStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    courseStatText: {
        fontSize: 12,
    },
});
