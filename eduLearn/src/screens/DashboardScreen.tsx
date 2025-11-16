import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const DashboardScreen: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { theme } = useTheme();

    // Get user role from user object (comes from backend)
    const userRole = user?.role || 'student';

    const renderStudentDashboard = () => (
        <ThemedView variant="default" style={styles.container}>
            <ThemedText variant="default" size="xxl" weight="bold" style={styles.title}>
                Dashboard
            </ThemedText>

            {/* Stats Cards */}
            <ThemedView variant="default" style={styles.statsContainer}>
                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">5</ThemedText>
                    <ThemedText variant="secondary" size="sm">Active Courses</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">12</ThemedText>
                    <ThemedText variant="secondary" size="sm">Completed</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">85%</ThemedText>
                    <ThemedText variant="secondary" size="sm">Avg Score</ThemedText>
                </ThemedView>
            </ThemedView>

            {/* Current Courses */}
            <ThemedView variant="default" style={styles.section}>
                <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                    Current Courses
                </ThemedText>

                <ThemedView variant="surface" style={styles.courseCard}>
                    <ThemedText variant="default" size="lg" weight="semibold">
                        Introduction to React Native
                    </ThemedText>
                    <ThemedText variant="secondary" size="sm" style={styles.courseProgress}>
                        Progress: 65%
                    </ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.courseCard}>
                    <ThemedText variant="default" size="lg" weight="semibold">
                        Advanced TypeScript
                    </ThemedText>
                    <ThemedText variant="secondary" size="sm" style={styles.courseProgress}>
                        Progress: 42%
                    </ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );

    const renderInstructorDashboard = () => (
        <ThemedView variant="default" style={styles.container}>
            <ThemedText variant="default" size="xxl" weight="bold" style={styles.title}>
                Instructor Dashboard
            </ThemedText>

            {/* Stats Cards */}
            <ThemedView variant="default" style={styles.statsContainer}>
                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">8</ThemedText>
                    <ThemedText variant="secondary" size="sm">Active Courses</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">245</ThemedText>
                    <ThemedText variant="secondary" size="sm">Total Students</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">4.8</ThemedText>
                    <ThemedText variant="secondary" size="sm">Avg Rating</ThemedText>
                </ThemedView>
            </ThemedView>

            {/* Recent Activity */}
            <ThemedView variant="default" style={styles.section}>
                <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                    Recent Activity
                </ThemedText>

                <ThemedView variant="surface" style={styles.activityCard}>
                    <ThemedText variant="default" size="md">
                        15 new assignments submitted
                    </ThemedText>
                    <ThemedText variant="secondary" size="sm">2 hours ago</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.activityCard}>
                    <ThemedText variant="default" size="md">
                        New student enrolled in React Native course
                    </ThemedText>
                    <ThemedText variant="secondary" size="sm">5 hours ago</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );

    const renderAdminDashboard = () => (
        <ThemedView variant="default" style={styles.container}>
            <ThemedText variant="default" size="xxl" weight="bold" style={styles.title}>
                Admin Dashboard
            </ThemedText>

            {/* Stats Cards */}
            <ThemedView variant="default" style={styles.statsContainer}>
                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">1,234</ThemedText>
                    <ThemedText variant="secondary" size="sm">Total Users</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">45</ThemedText>
                    <ThemedText variant="secondary" size="sm">Active Courses</ThemedText>
                </ThemedView>

                <ThemedView variant="surface" style={styles.statCard}>
                    <ThemedText variant="primary" size="xxl" weight="bold">98%</ThemedText>
                    <ThemedText variant="secondary" size="sm">Uptime</ThemedText>
                </ThemedView>
            </ThemedView>

            {/* System Status */}
            <ThemedView variant="default" style={styles.section}>
                <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                    System Status
                </ThemedText>

                <ThemedView variant="surface" style={styles.statusCard}>
                    <ThemedText variant="success" size="lg" weight="semibold">
                        ✓ All Systems Operational
                    </ThemedText>
                    <ThemedText variant="secondary" size="sm" style={styles.statusDetail}>
                        Last checked: Just now
                    </ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );

    if (!Boolean(isAuthenticated)) {
        return (
            <ThemedView variant="default" style={styles.container}>
                <ThemedText variant="secondary" size="lg" style={styles.emptyState}>
                    Please log in to view your dashboard
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.scrollView}>
            {userRole === 'admin' && renderAdminDashboard()}
            {userRole === 'instructor' && renderInstructorDashboard()}
            {userRole === 'student' && renderStudentDashboard()}
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
    title: {
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    courseCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    courseProgress: {
        marginTop: 8,
    },
    activityCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    statusCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusDetail: {
        marginTop: 8,
    },
    emptyState: {
        textAlign: 'center',
        marginTop: 40,
    },
});

export default DashboardScreen;
