import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '../../components/common/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { courseService, enrollmentService, progressService } from '../../services/courseService';
import { Course, Progress, calculateProgressPercent } from '../../types/course';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '../../components/common/LoadingScreen';

type StudentHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const StudentHomeScreen: React.FC = () => {
    const navigation = useNavigation<StudentHomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [progress, setProgress] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
        loadStats();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [coursesData, enrollmentsData, progressData] = await Promise.all([
                courseService.getCourses(),
                enrollmentService.getEnrollments(),
                progressService.getProgress(),
            ]);

            setAllCourses(coursesData);

            // Filter enrolled courses for current user
            const userEnrollments = enrollmentsData.filter(e => e.student.id === user?.id);
            const enrolledCourseIds = userEnrollments.map(e => e.course.id);
            const userEnrolledCourses = coursesData.filter(c => enrolledCourseIds.includes(c.id));
            setEnrolledCourses(userEnrolledCourses);

            // Filter progress for current user
            const userProgress = progressData.filter(p => p.student === user?.id);
            setProgress(userProgress);
        } catch (error: any) {
            console.error('Error loading dashboard data:', error);
            // If 401, set empty data
            if (error?.response?.status === 401) {
                setAllCourses([]);
                setEnrolledCourses([]);
                setProgress([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const loadStats = async () => {
        try {
            const data = await progressService.getUserStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading your dashboard..." />;
    }

    const totalEnrolled = stats?.total_enrolled || enrolledCourses.length;
    const totalChapters = stats?.total_chapters || enrolledCourses.reduce((sum, course) => sum + (course.chapters?.length || 0), 0);
    const completedLessons = stats?.completed_lessons || progress.reduce((sum, p) => sum + p.completed_lessons, 0);
    const averageScore = stats?.average_score || (progress.length > 0
        ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
        : 0);
    const completedCourses = stats?.completed_courses || 0;
    const quizStats = stats?.quiz_stats || {
        total_quizzes: 0,
        quizzes_completed: 0,
        correct_answers: 0,
        wrong_answers: 0,
        accuracy: 0
    };

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
            }
        >
            {/* Welcome Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerContent}>
                    <View>
                        <ThemedText style={[styles.welcomeText, { color: '#FFFFFF' }]}>
                            Welcome back,
                        </ThemedText>
                        <ThemedText style={[styles.userName, { color: '#FFFFFF' }]}>
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

            <View style={styles.content}>
                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                            <Ionicons name="book-outline" size={24} color="#4CAF50" />
                        </View>
                        <ThemedText style={styles.statValue}>{totalEnrolled}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Enrolled Courses
                        </ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' + '20' }]}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#2196F3" />
                        </View>
                        <ThemedText style={styles.statValue}>{completedLessons}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Completed Lessons
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FF9800' + '20' }]}>
                            <Ionicons name="layers-outline" size={24} color="#FF9800" />
                        </View>
                        <ThemedText style={styles.statValue}>{totalChapters}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Total Chapters
                        </ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
                            <Ionicons name="trophy-outline" size={24} color="#9C27B0" />
                        </View>
                        <ThemedText style={styles.statValue}>{averageScore}%</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Average Score
                        </ThemedText>
                    </View>
                </View>

                {/* Quiz Statistics */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#00BCD4' + '20' }]}>
                            <Ionicons name="help-circle-outline" size={24} color="#00BCD4" />
                        </View>
                        <ThemedText style={styles.statValue}>{quizStats.quizzes_completed}/{quizStats.total_quizzes}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Quizzes Completed
                        </ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                            <Ionicons name="checkmark-done-outline" size={24} color="#4CAF50" />
                        </View>
                        <ThemedText style={styles.statValue}>{quizStats.correct_answers}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Correct Answers
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#F44336' + '20' }]}>
                            <Ionicons name="close-circle-outline" size={24} color="#F44336" />
                        </View>
                        <ThemedText style={styles.statValue}>{quizStats.wrong_answers}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Wrong Answers
                        </ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FF5722' + '20' }]}>
                            <Ionicons name="star-outline" size={24} color="#FF5722" />
                        </View>
                        <ThemedText style={styles.statValue}>{quizStats.accuracy}%</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Quiz Accuracy
                        </ThemedText>
                    </View>
                </View>

                {/* Continue Learning Section */}
                {enrolledCourses.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>Continue Learning</ThemedText>
                            <TouchableOpacity onPress={() => {/* Navigate to Courses tab */ }}>
                                <ThemedText style={[styles.seeAll, { color: theme.colors.primary }]}>
                                    See All
                                </ThemedText>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {enrolledCourses.slice(0, 5).map((course) => {
                                const colors = ['4ECDC4', 'FF6B6B', '45B7D1', '96CEB4', 'FFEAA7', 'DFE6E9'];
                                const colorIndex = course.id % colors.length;
                                const placeholderColor = colors[colorIndex];
                                const imageUrl = course.thumbnail_image || `https://via.placeholder.com/200x120/${placeholderColor}/FFFFFF?text=Course`;

                                return (
                                    <TouchableOpacity
                                        key={course.id}
                                        style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                                        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    >
                                        <Image
                                            source={{ uri: imageUrl }}
                                            style={styles.courseImage}
                                        />
                                        <View style={styles.courseInfo}>
                                            <ThemedText style={styles.courseTitle} numberOfLines={2}>
                                                {course.title}
                                            </ThemedText>
                                            <ThemedText variant="secondary" style={styles.courseInstructor} numberOfLines={1}>
                                                {course.instructor.username}
                                            </ThemedText>
                                            <View style={styles.courseProgress}>
                                                <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
                                                    <View
                                                        style={[
                                                            styles.progressFill,
                                                            {
                                                                backgroundColor: theme.colors.primary,
                                                                width: `${(() => {
                                                                    const p = progress.find(p => p.course === course.id);
                                                                    return p ? calculateProgressPercent(p) : 0;
                                                                })()}%`
                                                            }
                                                        ]}
                                                    />
                                                </View>
                                                <ThemedText variant="secondary" style={styles.progressText}>
                                                    {(() => {
                                                        const p = progress.find(p => p.course === course.id);
                                                        return Math.round(p ? calculateProgressPercent(p) : 0);
                                                    })()}%
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Explore More Courses */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Explore More Courses</ThemedText>
                        <TouchableOpacity onPress={() => {/* Navigate to Courses tab */ }}>
                            <ThemedText style={[styles.seeAll, { color: theme.colors.primary }]}>
                                See All
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {allCourses.slice(0, 3).map((course) => {
                        const colors = ['4ECDC4', 'FF6B6B', '45B7D1', '96CEB4', 'FFEAA7', 'DFE6E9'];
                        const colorIndex = course.id % colors.length;
                        const placeholderColor = colors[colorIndex];
                        const imageUrl = course.thumbnail_image || `https://via.placeholder.com/100/${placeholderColor}/FFFFFF?text=Course`;

                        return (
                            <TouchableOpacity
                                key={course.id}
                                style={[styles.listCourseCard, { backgroundColor: theme.colors.card }]}
                                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                            >
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.listCourseImage}
                                />
                                <View style={styles.listCourseInfo}>
                                    <ThemedText style={styles.listCourseTitle} numberOfLines={2}>
                                        {course.title}
                                    </ThemedText>
                                    <ThemedText variant="secondary" style={styles.listCourseInstructor}>
                                        {course.instructor.username}
                                    </ThemedText>
                                    <View style={styles.listCourseMeta}>
                                        <Ionicons name="book-outline" size={14} color={theme.colors.textSecondary} />
                                        <ThemedText variant="secondary" style={styles.listCourseMetaText}>
                                            {course.chapters?.length || 0} chapters
                                        </ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    content: {
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    courseCard: {
        width: 200,
        marginRight: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    courseImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#E5E7EB',
    },
    courseInfo: {
        padding: 12,
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        minHeight: 36,
    },
    courseInstructor: {
        fontSize: 12,
        marginBottom: 8,
    },
    courseProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        fontWeight: '600',
    },
    listCourseCard: {
        flexDirection: 'row',
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listCourseImage: {
        width: 100,
        height: 100,
        backgroundColor: '#E5E7EB',
    },
    listCourseInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    listCourseTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    listCourseInstructor: {
        fontSize: 12,
        marginBottom: 4,
    },
    listCourseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    listCourseMetaText: {
        fontSize: 11,
    },
});
