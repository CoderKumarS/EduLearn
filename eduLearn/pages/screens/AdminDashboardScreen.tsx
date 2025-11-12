import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedText } from '../components';
import { StatCard } from '../components/StatCard';
import { AlertCard } from '../components/AlertCard';
import { UserListItem } from '../components/UserListItem';

interface AdminDashboardScreenProps {
    onNavigateBack?: () => void;
    onNavigateToContentModeration?: () => void;
}

interface AdminStats {
    totalUsers: number;
    activeCourses: number;
    pendingReviews: number;
}

interface SystemAlert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
}

interface RecentUser {
    id: string;
    name: string;
    role: string;
    avatar: string;
}

interface ActiveCourse {
    id: string;
    name: string;
    status: 'active' | 'draft';
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigateToContentModeration }) => {
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 12450,
        activeCourses: 2130,
        pendingReviews: 185,
    });

    const [alerts] = useState<SystemAlert[]>([
        {
            id: '1',
            type: 'critical',
            title: 'Critical system update available',
            message: 'Restart required.',
            actionLabel: 'Resolve Now',
        },
        {
            id: '2',
            type: 'warning',
            title: 'New instructor registration pending approval',
            message: '',
            actionLabel: 'Review Applicants',
        },
    ]);

    const [recentUsers] = useState<RecentUser[]>([
        {
            id: '1',
            name: 'Arjun Smith',
            role: 'student',
            avatar: '',
        },
        {
            id: '2',
            name: 'Rishi Johnson',
            role: 'instructor',
            avatar: '',
        },
        {
            id: '3',
            name: 'Charlie Brown',
            role: 'student',
            avatar: '',
        },
    ]);

    const [activeCourses] = useState<ActiveCourse[]>([
        {
            id: '1',
            name: 'Advanced React',
            status: 'active',
        },
        {
            id: '2',
            name: 'Data Science Fundamentals',
            status: 'active',
        },
        {
            id: '3',
            name: 'Mobile App UX',
            status: 'draft',
        },
    ]);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const handleAlertAction = (alertId: string) => {
        console.log('Alert action:', alertId);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={[styles.header, { paddingHorizontal: theme.spacing.md }]}>
                    <ThemedText style={[theme.typography.h1, { color: theme.colors.text }]}>
                        Admin Dashboard
                    </ThemedText>
                    <TouchableOpacity>
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Overview Section */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
                        Overview
                    </ThemedText>
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Total Users"
                            value={stats.totalUsers}
                            icon={<Ionicons name="people" size={24} color={theme.colors.primary} />}
                            iconColor={theme.colors.primary + '20'}
                        />
                        <StatCard
                            label="Active Courses"
                            value={stats.activeCourses}
                            icon={<Ionicons name="book" size={24} color={theme.colors.success} />}
                            iconColor={theme.colors.success + '20'}
                        />
                    </View>
                    <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
                        <StatCard
                            label="Pending Reviews"
                            value={stats.pendingReviews}
                            icon={<Ionicons name="chatbox-ellipses" size={24} color={theme.colors.warning} />}
                            iconColor={theme.colors.warning + '20'}
                        />
                        <View style={{ flex: 1, marginHorizontal: 4 }} />
                    </View>
                </View>

                {/* System Alerts Section */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
                        System Alerts
                    </ThemedText>
                    {alerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            type={alert.type}
                            icon={
                                <Ionicons
                                    name={alert.type === 'critical' ? 'alert-circle' : 'warning'}
                                    size={24}
                                    color={alert.type === 'critical' ? theme.colors.error : theme.colors.warning}
                                />
                            }
                            title={alert.title}
                            message={alert.message}
                            actionLabel={alert.actionLabel}
                            onAction={() => handleAlertAction(alert.id)}
                        />
                    ))}
                </View>

                {/* Recent Users Section */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md }]}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
                            Recent Users
                        </ThemedText>
                        <TouchableOpacity>
                            <ThemedText style={[theme.typography.body, { color: theme.colors.primary, fontWeight: '600' }]}>
                                View All
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md }]}>
                        <View style={styles.tableHeader}>
                            <ThemedText style={[styles.tableHeaderText, theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                User
                            </ThemedText>
                            <ThemedText style={[styles.tableHeaderText, theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Role
                            </ThemedText>
                        </View>
                        {recentUsers.map((user, index) => (
                            <UserListItem
                                key={user.id}
                                name={user.name}
                                role={user.role}
                                avatar={user.avatar}
                            />
                        ))}
                    </View>
                </View>

                {/* Active Courses Section */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md }]}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
                            Active Courses
                        </ThemedText>
                        <TouchableOpacity>
                            <ThemedText style={[theme.typography.body, { color: theme.colors.primary, fontWeight: '600' }]}>
                                View All
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md }]}>
                        <View style={styles.tableHeader}>
                            <ThemedText style={[styles.tableHeaderText, theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Course
                            </ThemedText>
                            <ThemedText style={[styles.tableHeaderText, theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Status
                            </ThemedText>
                            <ThemedText style={[styles.tableHeaderText, theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Action
                            </ThemedText>
                        </View>
                        {activeCourses.map((course) => (
                            <View key={course.id} style={styles.courseRow}>
                                <View style={styles.courseIcon}>
                                    <Ionicons name="book-outline" size={20} color={theme.colors.text} />
                                </View>
                                <View style={styles.courseInfo}>
                                    <ThemedText style={[theme.typography.body, { color: theme.colors.text }]}>
                                        {course.name}
                                    </ThemedText>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor: course.status === 'active' ? theme.colors.success + '20' : theme.colors.warning + '20',
                                            borderRadius: theme.borderRadius.sm,
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            theme.typography.small,
                                            {
                                                color: course.status === 'active' ? theme.colors.success : theme.colors.warning,
                                                fontWeight: '600',
                                            },
                                        ]}
                                    >
                                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity>
                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Content Moderation Section */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.xxl }]}>
                    <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
                        Content Moderation
                    </ThemedText>
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.md }]}>
                        <ThemedText style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
                            Manage submitted course materials and student discussions.
                        </ThemedText>
                        <TouchableOpacity
                            style={[
                                styles.moderationButton,
                                {
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: theme.borderRadius.sm,
                                },
                            ]}
                            onPress={onNavigateToContentModeration}
                        >
                            <ThemedText style={[theme.typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
                                Manage Content
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
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
        fontWeight: '700',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: '600',
    },
    courseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    courseIcon: {
        marginRight: 12,
    },
    courseInfo: {
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 12,
    },
    moderationButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
});
