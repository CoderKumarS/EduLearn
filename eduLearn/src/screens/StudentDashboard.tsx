import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { courseService } from '../services/courseService';
import { Enrollment, Progress, calculateProgressPercent } from '../types/course';
import { handleApiError } from '../utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';

interface StudentDashboardProps {
    onNavigateBack: () => void;
    onNavigateToCourse: (courseId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
    onNavigateBack,
    onNavigateToCourse,
}) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [progress, setProgress] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [enrollmentsData, progressData] = await Promise.all([
                courseService.getEnrollments(),
                courseService.getProgress(),
            ]);

            // Filter for current student's data
            const studentEnrollments = enrollmentsData.filter(
                enrollment => enrollment.student.id === user?.id
            );
            const studentProgress = progressData.filter(
                prog => prog.student === user?.id
            );

            setEnrollments(studentEnrollments);
            setProgress(studentProgress);
        } catch (error) {
            const apiError = handleApiError(error);
            console.warn('Failed to load student data:', apiError.message);
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

    const getProgressForCourse = (courseId: string) => {
        return progress.find(prog => prog.course === courseId);
    };

    const calculateOverallProgress = () => {
        if (progress.length === 0) return 0;
        const totalScore = progress.reduce((sum, prog) => sum + prog.score, 0);
        return Math.round(totalScore / progress.length);
    };



    const enrolledCourses = [
        {
            id: '1',
            title: 'Introduction to AI Ethics',
            instructor: 'Dr. Emily Watson',
            progress: 75,
            image: 'https://via.placeholder.com/200/6B46C1/FFFFFF?text=AI+Ethics',
        },
        {
            id: '2',
            title: 'Advanced Machine Learning Tech',
            instructor: 'Prof. David Lee',
            progress: 40,
            image: 'https://via.placeholder.com/200/1E40AF/FFFFFF?text=ML',
        },
        {
            id: '3',
            title: 'Data Visualization with Python',
            instructor: 'Ms. Sarah Chen',
            progress: 90,
            image: 'https://via.placeholder.com/200/DB2777/FFFFFF?text=Data+Viz',
        },
    ];

    const notifications = [
        {
            id: '1',
            icon: 'document-text-outline',
            title: 'New assignment posted for "Introduction to AI Ethics"',
            subtitle: 'Due May 15',
            time: '2 hours ago',
        },
        {
            id: '2',
            icon: 'trophy-outline',
            title: 'Your quiz score for "Data Structures" is available: 88%',
            time: 'Yesterday',
        },
        {
            id: '3',
            icon: 'videocam-outline',
            title: 'Live Q&A session for "Advanced ML" on Friday at 3 PM',
            time: '1 day ago',
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.content}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <ThemedText style={styles.welcomeTitle}>
                            Welcome back, {user?.username || 'Alex'}!
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.welcomeSubtitle}>
                            Your learning journey continues.
                        </ThemedText>
                    </View>

                    {/* Learning Progress Card */}
                    <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.progressCardHeader}>
                            <ThemedText style={styles.progressCardTitle}>Your Learning Progress</ThemedText>
                            <TouchableOpacity>
                                <Ionicons name="expand-outline" size={20} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.progressStats}>
                            <View style={styles.progressStatItem}>
                                <ThemedText style={styles.progressStatLabel}>Courses Completed:</ThemedText>
                                <ThemedText style={styles.progressStatValue}>3/5</ThemedText>
                            </View>
                            <View style={styles.progressStatItem}>
                                <ThemedText style={styles.progressStatLabel}>Overall Progress</ThemedText>
                                <ThemedText style={styles.progressStatValue}>60%</ThemedText>
                            </View>
                        </View>
                        <View style={styles.progressStatItem}>
                            <ThemedText style={styles.progressStatLabel}>Study Hours this Week:</ThemedText>
                            <ThemedText style={styles.progressStatValue}>8 hrs</ThemedText>
                        </View>
                        <TouchableOpacity style={styles.viewDetailedButton}>
                            <ThemedText style={[styles.viewDetailedText, { color: theme.colors.primary }]}>
                                View Detailed Progress
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActionsSection}>
                        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
                        <View style={styles.quickActionsRow}>
                            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}>
                                <Ionicons name="bulb-outline" size={24} color={theme.colors.primary} />
                                <ThemedText style={styles.quickActionText}>AI Tutor</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}>
                                <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
                                <ThemedText style={styles.quickActionText}>AI Quiz</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Enrolled Courses */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Your Enrolled Courses</ThemedText>
                        <View style={styles.coursesList}>
                            {enrolledCourses.map((course) => (
                                <TouchableOpacity
                                    key={course.id}
                                    style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                                    onPress={() => onNavigateToCourse(course.id)}
                                >
                                    <Image
                                        source={{ uri: course.image }}
                                        style={styles.courseImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.courseInfo}>
                                        <ThemedText style={styles.courseTitle} numberOfLines={2}>
                                            {course.title}
                                        </ThemedText>
                                        <ThemedText variant="secondary" style={styles.courseInstructor}>
                                            {course.instructor}
                                        </ThemedText>
                                        <View style={styles.progressContainer}>
                                            <ThemedText variant="secondary" style={styles.progressLabel}>
                                                Progress
                                            </ThemedText>
                                            <ThemedText style={styles.progressValue}>{course.progress}%</ThemedText>
                                        </View>
                                        <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        backgroundColor: '#00D9FF',
                                                        width: `${course.progress}%`,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Recent Notifications */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Recent Notifications</ThemedText>
                        <View style={styles.notificationsList}>
                            {notifications.map((notification) => (
                                <View key={notification.id} style={styles.notificationItem}>
                                    <View style={[styles.notificationIcon, { backgroundColor: '#E0F2FE' }]}>
                                        <Ionicons name={notification.icon as any} size={20} color="#0284C7" />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <ThemedText style={styles.notificationTitle} numberOfLines={2}>
                                            {notification.title}
                                        </ThemedText>
                                        {notification.subtitle && (
                                            <ThemedText variant="secondary" style={styles.notificationSubtitle}>
                                                {notification.subtitle}
                                            </ThemedText>
                                        )}
                                        <ThemedText variant="secondary" style={styles.notificationTime}>
                                            {notification.time}
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    notificationButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    welcomeSection: {
        marginBottom: 20,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 14,
    },
    progressCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    progressCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressCardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressStatItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressStatLabel: {
        fontSize: 13,
    },
    progressStatValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    viewDetailedButton: {
        marginTop: 8,
    },
    viewDetailedText: {
        fontSize: 13,
        fontWeight: '600',
    },
    quickActionsSection: {
        marginBottom: 20,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    coursesList: {
        gap: 12,
    },
    courseCard: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
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
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    courseInstructor: {
        fontSize: 12,
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 11,
    },
    progressValue: {
        fontSize: 11,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    notificationsList: {
        gap: 12,
    },
    notificationItem: {
        flexDirection: 'row',
        gap: 12,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 2,
    },
    notificationSubtitle: {
        fontSize: 12,
        marginBottom: 2,
    },
    notificationTime: {
        fontSize: 11,
    },
});
