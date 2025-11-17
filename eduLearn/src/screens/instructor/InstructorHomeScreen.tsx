import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { instructorService } from '../../services/instructorService';
import { courseService } from '../../services/courseService';
import { InstructorStats } from '../../types/course';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { InstructorCourseCard } from '../../components/instructor/InstructorCourseCard';
import { getFullImageUrl } from '../../utils/imageUtils';

type InstructorHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const InstructorHomeScreen: React.FC = () => {
    const navigation = useNavigation<InstructorHomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [stats, setStats] = useState<InstructorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadInstructorData();
    }, []);

    const loadInstructorData = async () => {
        try {
            setLoading(true);
            const instructorStats = await instructorService.getInstructorStats();
            setStats(instructorStats);
        } catch (error: any) {
            console.error('Error loading instructor data:', error);
            // If 401, user needs to re-login
            if (error?.response?.status === 401) {
                // Return empty stats to show empty state
                setStats({
                    total_courses: 0,
                    total_students: 0,
                    courses: []
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadInstructorData();
        setRefreshing(false);
    };

    const handleDeleteCourse = async (courseId: number, courseTitle: string) => {
        Alert.alert(
            'Delete Course',
            `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await courseService.deleteCourse(courseId);
                            // Reload data after deletion
                            await loadInstructorData();
                        } catch (error) {
                            console.error('Error deleting course:', error);
                            Alert.alert('Error', 'Failed to delete course. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingScreen message="Loading your dashboard..." />;
    }

    const totalCourses = stats?.total_courses || 0;
    const totalStudents = stats?.total_students || 0;
    const courses = stats?.courses || [];

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
                    {user?.profile_image && getFullImageUrl(user.profile_image) ? (
                        <Image
                            source={{ uri: getFullImageUrl(user.profile_image)! }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={[styles.profileImagePlaceholder, { backgroundColor: '#FFFFFF' }]}>
                            <ThemedText style={styles.profileInitial}>
                                {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' + '20' }]}>
                            <Ionicons name="book-outline" size={24} color="#2196F3" />
                        </View>
                        <ThemedText style={styles.statValue}>{totalCourses}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Courses Created
                        </ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                            <Ionicons name="people-outline" size={24} color="#4CAF50" />
                        </View>
                        <ThemedText style={styles.statValue}>{totalStudents}</ThemedText>
                        <ThemedText variant="secondary" style={styles.statLabel}>
                            Total Students
                        </ThemedText>
                    </View>
                </View>

                {/* My Courses Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>My Courses</ThemedText>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateCourse')}>
                            <View style={styles.addButton}>
                                <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                                <ThemedText style={[styles.addButtonText, { color: theme.colors.primary }]}>
                                    New
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {courses.length > 0 ? (
                        courses.map((course, index) => (
                            <View key={course.id} style={index > 0 ? styles.courseCardMargin : undefined}>
                                <InstructorCourseCard
                                    course={course}
                                    onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    onEdit={() => {
                                        navigation.navigate('ManageCourse', { courseId: course.id });
                                    }}
                                    onDelete={() => handleDeleteCourse(course.id, course.title)}
                                />
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
                            <Ionicons name="book-outline" size={64} color={theme.colors.textSecondary} />
                            <ThemedText variant="secondary" style={styles.emptyText}>
                                No courses created yet
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.emptySubtext}>
                                Create your first course to start teaching
                            </ThemedText>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                                onPress={() => navigation.navigate('CreateCourse')}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                                <ThemedText style={styles.createButtonText}>Create Course</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={[styles.quickActions, { backgroundColor: theme.colors.card }]}>
                    <ThemedText style={styles.quickActionsTitle}>Quick Actions</ThemedText>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('CreateCourse')}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.actionButtonText}>Create New Course</ThemedText>
                    </TouchableOpacity>
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
    profileImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3B82F6',
    },
    content: {
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
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
        marginBottom: 24,
    },
    courseCardMargin: {
        marginTop: 16,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
        marginTop: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    quickActions: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
