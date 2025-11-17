import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { StatCard } from '../common/StatCard';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { Ionicons } from '@expo/vector-icons';

interface DashboardStats {
    enrolledCourses: number;
    completedCourses: number;
    totalLearningTime: number;
    currentStreak: number;
    averageScore: number;
    weeklyProgress: {
        date: string;
        minutesLearned: number;
    }[];
    recentActivity: {
        id: number;
        type: string;
        title: string;
        timestamp: string;
    }[];
}

interface DashboardViewProps {
    stats: DashboardStats;
    isLoading?: boolean;
    onEnrolledPress?: () => void;
    onCompletedPress?: () => void;
    onAverageScorePress?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    stats,
    isLoading,
    onEnrolledPress,
    onCompletedPress,
    onAverageScorePress,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Statistics Cards Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                    <StatCard
                        label="Enrolled"
                        value={stats.enrolledCourses}
                        icon={
                            <Ionicons
                                name="book"
                                size={24}
                                color="#3B82F6"
                            />
                        }
                        accentColor="#3B82F6"
                        onPress={onEnrolledPress}
                    />
                    <StatCard
                        label="Completed"
                        value={stats.completedCourses}
                        icon={
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="#10B981"
                            />
                        }
                        accentColor="#10B981"
                        onPress={onCompletedPress}
                    />
                </View>
                <View style={styles.statsRow}>
                    <StatCard
                        label="Learning Time"
                        value={`${Math.floor(stats.totalLearningTime / 60)}h`}
                        icon={
                            <Ionicons
                                name="time"
                                size={24}
                                color="#8B5CF6"
                            />
                        }
                        accentColor="#8B5CF6"
                    />
                    <StatCard
                        label="Day Streak"
                        value={stats.currentStreak}
                        icon={
                            <Ionicons
                                name="flame"
                                size={24}
                                color="#F59E0B"
                            />
                        }
                        accentColor="#F59E0B"
                    />
                </View>
            </View>

            {/* Average Score Card */}
            <View style={styles.scoreCard}>
                <StatCard
                    label="Average Score"
                    value={`${stats.averageScore.toFixed(1)}%`}
                    icon={
                        <Ionicons
                            name="trophy"
                            size={24}
                            color="#EC4899"
                        />
                    }
                    accentColor="#EC4899"
                    onPress={onAverageScorePress}
                />
            </View>

            {/* Weekly Progress Chart */}
            <WeeklyProgressChart data={stats.weeklyProgress} />

            {/* Recent Activity Timeline */}
            <RecentActivityTimeline activities={stats.recentActivity} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsGrid: {
        padding: 16,
        paddingTop: 20,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    scoreCard: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
});
