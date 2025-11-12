import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { user, isAuthenticated } = useAuth();

    return (
        <ScrollView style={styles.scrollView}>
            <ThemedView variant="default" style={styles.container}>
                {/* Welcome Section */}
                <ThemedView variant="surface" style={styles.welcomeCard}>
                    <ThemedText variant="default" size="xxl" weight="bold" style={styles.welcomeTitle}>
                        Welcome to eduLearn
                    </ThemedText>
                    {Boolean(isAuthenticated) && user ? (
                        <ThemedText variant="secondary" size="lg" style={styles.welcomeSubtitle}>
                            Hello, {user.name}!
                        </ThemedText>
                    ) : (
                        <ThemedText variant="secondary" size="lg" style={styles.welcomeSubtitle}>
                            Your AI-Powered Learning Companion
                        </ThemedText>
                    )}
                </ThemedView>

                {/* Quick Actions */}
                <ThemedView variant="default" style={styles.section}>
                    <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                        Quick Actions
                    </ThemedText>

                    <ThemedView variant="default" style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                            onPress={() => navigation.navigate('Test')}
                        >
                            <ThemedText style={styles.actionIcon}>🧪</ThemedText>
                            <ThemedText variant="default" size="md" weight="semibold">
                                Test Screen
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.actionDescription}>
                                Test app features
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                            disabled={Boolean(true)}
                        >
                            <ThemedText style={styles.actionIcon}>📚</ThemedText>
                            <ThemedText variant="default" size="md" weight="semibold">
                                My Courses
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.actionDescription}>
                                View your courses
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                            disabled={Boolean(true)}
                        >
                            <ThemedText style={styles.actionIcon}>🤖</ThemedText>
                            <ThemedText variant="default" size="md" weight="semibold">
                                AI Tutor
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.actionDescription}>
                                Get instant help
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                            disabled={Boolean(true)}
                        >
                            <ThemedText style={styles.actionIcon}>📊</ThemedText>
                            <ThemedText variant="default" size="md" weight="semibold">
                                Progress
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.actionDescription}>
                                Track your learning
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>

                {/* Recent Activity */}
                <ThemedView variant="default" style={styles.section}>
                    <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                        Recent Activity
                    </ThemedText>

                    <ThemedView variant="surface" style={styles.activityCard}>
                        <ThemedText variant="secondary" size="md" style={styles.emptyState}>
                            No recent activity yet. Start learning to see your progress here!
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
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
    welcomeCard: {
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
    },
    welcomeTitle: {
        marginBottom: 8,
    },
    welcomeSubtitle: {
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionDescription: {
        marginTop: 4,
        textAlign: 'center',
    },
    activityCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyState: {
        textAlign: 'center',
    },
});

export default HomeScreen;
