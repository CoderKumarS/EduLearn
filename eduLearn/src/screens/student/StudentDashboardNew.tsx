import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import courseService from '../../services/courseService';
import cacheManager from '../../utils/cacheManager';
import api from '../../services/api';

export const StudentDashboardNew: React.FC = () => {
    const { theme } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const navigation = useNavigation<any>();
    const [refreshing, setRefreshing] = useState(false);

    const [dashboardStats, setDashboardStats] = useState<any>({
        enrolledCourses: 0,
        completedCourses: 0,
        totalLearningTime: 0,
        currentStreak: 0,
        averageScore: 0,
        weeklyProgress: [],
        recentActivity: [],
    });

    const [loading, setLoading] = useState(true);

    // Modal states
    const [showEnrolledModal, setShowEnrolledModal] = useState(false);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [showScoresModal, setShowScoresModal] = useState(false);

    // Data for modals
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [completedCourses, setCompletedCourses] = useState<any[]>([]);
    const [quizScores, setQuizScores] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (useCache: boolean = true) => {
        try {
            setLoading(true);

            if (useCache) {
                const cachedStats = await cacheManager.getStale('dashboardStats');
                if (cachedStats.data) setDashboardStats(cachedStats.data as any);

                if (!cachedStats.isStale) {
                    setLoading(false);
                    return;
                }
            }

            const statsData = await courseService.getDashboardStats();
            setDashboardStats(statsData);
            await cacheManager.set('dashboardStats', statsData);
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(false);
        setRefreshing(false);
    };

    const handleEnrolledPress = async () => {
        try {
            // Load enrolled courses with progress data
            const courses = await courseService.getContinueLearning();
            const recentlyJoined = await courseService.getRecentlyJoined(100);

            // Create a map with continue learning courses first (they have progress data)
            const courseMap = new Map(courses.map(c => [c.id, c]));

            // Add recently joined courses only if they're not already in the map
            recentlyJoined.forEach((course: any) => {
                if (!courseMap.has(course.id)) {
                    courseMap.set(course.id, course);
                }
            });

            const uniqueCourses = Array.from(courseMap.values());
            setEnrolledCourses(uniqueCourses);
            setShowEnrolledModal(true);
        } catch (error) {
            console.error('Error loading enrolled courses:', error);
        }
    };

    const handleCompletedPress = async () => {
        try {
            // For now, filter enrolled courses with 100% progress
            const courses = await courseService.getContinueLearning();
            const completed = courses.filter((c: any) => c.progress === 100);
            setCompletedCourses(completed);
            setShowCompletedModal(true);
        } catch (error) {
            console.error('Error loading completed courses:', error);
        }
    };

    const handleAverageScorePress = async () => {
        try {
            // Fetch quiz attempts from API using the api service
            const response = await api.get('/quiz-attempts/');
            const data = response.data.results || response.data || [];
            setQuizScores(data);
            setShowScoresModal(true);
        } catch (error) {
            console.error('Error loading quiz scores:', error);
            // Show modal with empty data
            setQuizScores([]);
            setShowScoresModal(true);
        }
    };

    // Show static dashboard with login prompt for non-authenticated users
    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
                </View>
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.guestContent}
                >
                    {/* Login Prompt */}
                    <View style={[styles.loginPrompt, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="lock-closed-outline" size={48} color={theme.colors.primary} />
                        <Text style={[styles.loginPromptTitle, { color: theme.colors.text }]}>
                            Login to See Your Statistics
                        </Text>
                        <Text style={[styles.loginPromptDescription, { color: theme.colors.textSecondary }]}>
                            Track your progress, view your achievements, and monitor your learning journey
                        </Text>
                        <Button
                            title="Sign In"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.loginPromptButton}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                                Don't have an account? Sign up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Static Stats Preview */}
                    <View style={styles.statsPreview}>
                        <Text style={[styles.statsPreviewTitle, { color: theme.colors.text }]}>
                            What You'll Track
                        </Text>

                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Enrolled Courses"
                                value="0"
                                icon={<Ionicons name="book-outline" size={24} color="#4CAF50" />}
                                accentColor="#4CAF50"
                            />
                            <StatCard
                                label="Completed Courses"
                                value="0"
                                icon={<Ionicons name="checkmark-circle-outline" size={24} color="#2196F3" />}
                                accentColor="#2196F3"
                            />
                        </View>

                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Learning Time"
                                value="0h"
                                icon={<Ionicons name="time-outline" size={24} color="#FF9800" />}
                                accentColor="#FF9800"
                            />
                            <StatCard
                                label="Current Streak"
                                value="0 days"
                                icon={<Ionicons name="flame-outline" size={24} color="#F44336" />}
                                accentColor="#F44336"
                            />
                        </View>

                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Average Score"
                                value="0%"
                                icon={<Ionicons name="trophy-outline" size={24} color="#9C27B0" />}
                                accentColor="#9C27B0"
                            />
                            <StatCard
                                label="Certificates"
                                value="0"
                                icon={<Ionicons name="ribbon-outline" size={24} color="#00BCD4" />}
                                accentColor="#00BCD4"
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const renderCourseItem = ({ item }: { item: any }) => {
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#F97316'];
        const colorIndex = item.id % colors.length;
        const gradientColor = colors[colorIndex];

        return (
            <TouchableOpacity
                style={[styles.modalCourseItem, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                    setShowEnrolledModal(false);
                    setShowCompletedModal(false);
                    navigation.navigate('CourseDetail', { courseId: item.id });
                }}
            >
                {item.thumbnail_image ? (
                    <Image source={{ uri: item.thumbnail_image }} style={styles.modalCourseImage} />
                ) : (
                    <LinearGradient
                        colors={[gradientColor, `${gradientColor}CC`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalCourseImage}
                    >
                        <Ionicons name="book" size={32} color="#FFFFFF" />
                    </LinearGradient>
                )}
                <View style={styles.modalCourseInfo}>
                    <Text style={[styles.modalCourseTitle, { color: theme.colors.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={[styles.modalCourseInstructor, { color: theme.colors.textSecondary }]}>
                        {item.instructor?.username || item.instructor_name}
                    </Text>
                    {item.progress !== undefined && (
                        <View style={styles.modalProgressContainer}>
                            <View style={[styles.modalProgressBar, { backgroundColor: theme.colors.border }]}>
                                <View
                                    style={[
                                        styles.modalProgressFill,
                                        { width: `${item.progress}%`, backgroundColor: theme.colors.primary },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.modalProgressText, { color: theme.colors.textSecondary }]}>
                                {Math.round(item.progress)}%
                            </Text>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    const renderQuizScoreItem = ({ item }: { item: any }) => {
        // Use the correct field names from the API response
        const percentage = parseFloat(item.percentage || '0');
        const score = parseFloat(item.score || '0');
        const maxScore = parseFloat(item.max_score || '0');
        const quizTitle = item.quiz_title || 'Quiz';
        const attemptNumber = item.attempt_number || 1;
        const timeTaken = item.time_taken_minutes || 0;

        return (
            <View style={[styles.modalScoreItem, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalScoreHeader}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={[styles.modalScoreTitle, { color: theme.colors.text }]} numberOfLines={2}>
                            {quizTitle}
                        </Text>
                        <Text style={[styles.modalScoreCourse, { color: theme.colors.textSecondary }]}>
                            Attempt #{attemptNumber} • {timeTaken > 0 ? `${timeTaken} min` : 'Quick attempt'}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.modalScoreBadge,
                            {
                                backgroundColor:
                                    percentage >= 80
                                        ? theme.colors.success + '20'
                                        : percentage >= 60
                                            ? theme.colors.warning + '20'
                                            : theme.colors.error + '20',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.modalScoreBadgeText,
                                {
                                    color:
                                        percentage >= 80
                                            ? theme.colors.success
                                            : percentage >= 60
                                                ? theme.colors.warning
                                                : theme.colors.error,
                                },
                            ]}
                        >
                            {percentage.toFixed(0)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.modalScorePoints}>
                    <View style={styles.modalScorePointsBox}>
                        <Text style={[styles.modalScorePointsLabel, { color: theme.colors.textSecondary }]}>
                            Points Earned
                        </Text>
                        <Text style={[styles.modalScorePointsValue, { color: theme.colors.text }]}>
                            {score.toFixed(0)} / {maxScore.toFixed(0)}
                        </Text>
                    </View>
                </View>

                <View style={styles.modalScoreDetails}>
                    <View style={styles.modalScoreDetailItem}>
                        <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                        <Text style={[styles.modalScoreDetail, { color: theme.colors.textSecondary }]}>
                            {timeTaken > 0 ? `${timeTaken} minutes` : 'Less than 1 min'}
                        </Text>
                    </View>
                    <View style={styles.modalScoreDetailItem}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                        <Text style={[styles.modalScoreDetail, { color: theme.colors.textSecondary }]}>
                            {new Date(item.completed_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                        setShowScoresModal(false);
                        navigation.navigate('Quiz', {
                            quizId: item.quiz,
                        });
                    }}
                >
                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                    <Text style={styles.retryButtonText}>Retry Quiz</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
            </View>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                <DashboardView
                    stats={dashboardStats}
                    isLoading={loading}
                    onEnrolledPress={handleEnrolledPress}
                    onCompletedPress={handleCompletedPress}
                    onAverageScorePress={handleAverageScorePress}
                />
            </ScrollView>

            {/* Enrolled Courses Modal */}
            <Modal
                visible={showEnrolledModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEnrolledModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Enrolled Courses</Text>
                            <TouchableOpacity onPress={() => setShowEnrolledModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={enrolledCourses}
                            renderItem={renderCourseItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.modalList}
                            ListEmptyComponent={
                                <Text style={[styles.modalEmptyText, { color: theme.colors.textSecondary }]}>
                                    No enrolled courses yet
                                </Text>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* Completed Courses Modal */}
            <Modal
                visible={showCompletedModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCompletedModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Completed Courses</Text>
                            <TouchableOpacity onPress={() => setShowCompletedModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={completedCourses}
                            renderItem={renderCourseItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.modalList}
                            ListEmptyComponent={
                                <Text style={[styles.modalEmptyText, { color: theme.colors.textSecondary }]}>
                                    No completed courses yet
                                </Text>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* Quiz Scores Modal */}
            <Modal
                visible={showScoresModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowScoresModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Quiz Scores</Text>
                            <TouchableOpacity onPress={() => setShowScoresModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={quizScores}
                            renderItem={renderQuizScoreItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.modalList}
                            ListEmptyComponent={
                                <Text style={[styles.modalEmptyText, { color: theme.colors.textSecondary }]}>
                                    No quiz scores available
                                </Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    guestContent: {
        padding: 20,
    },
    loginPrompt: {
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loginPromptTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    loginPromptDescription: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    loginPromptButton: {
        minWidth: 200,
        marginBottom: 16,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsPreview: {
        marginBottom: 20,
    },
    statsPreviewTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalList: {
        padding: 16,
    },
    modalEmptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    // Course item styles
    modalCourseItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalCourseImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCourseInfo: {
        flex: 1,
    },
    modalCourseTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    modalCourseInstructor: {
        fontSize: 14,
        marginBottom: 8,
    },
    modalProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalProgressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    modalProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    modalProgressText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 35,
    },
    // Quiz score item styles
    modalScoreItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalScoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalScoreTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    modalScoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    modalScoreBadgeText: {
        fontSize: 14,
        fontWeight: '700',
    },
    modalScoreCourse: {
        fontSize: 13,
        marginTop: 4,
    },
    modalScorePoints: {
        marginVertical: 12,
    },
    modalScorePointsBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalScorePointsLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    modalScorePointsValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalScoreDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    modalScoreDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modalScoreDetail: {
        fontSize: 13,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
