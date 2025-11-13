import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StudentDashboard } from './StudentDashboard';
import { InstructorDashboard } from './InstructorDashboard';
import { AdminDashboardScreen } from './AdminDashboardScreen';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <ThemedView variant="default" style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <ThemedText variant="secondary" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    // If authenticated, show role-specific dashboard
    if (Boolean(isAuthenticated) && user) {
        const userRole = user.role || 'student';

        // Navigation handlers
        const handleNavigateBack = () => {
            // Already on home screen
        };

        const handleNavigateToCourse = (courseId: string) => {
            navigation.navigate('CourseDetail', { courseId });
        };

        const handleCreateCourse = () => {
            navigation.navigate('CreateCourse');
        };

        switch (userRole) {
            case 'admin':
                return <AdminDashboardScreen onNavigateBack={handleNavigateBack} />;
            case 'instructor':
                return (
                    <InstructorDashboard
                        onNavigateBack={handleNavigateBack}
                        onNavigateToCourse={handleNavigateToCourse}
                        onCreateCourse={handleCreateCourse}
                    />
                );
            case 'student':
            default:
                return (
                    <StudentDashboard
                        onNavigateBack={handleNavigateBack}
                        onNavigateToCourse={handleNavigateToCourse}
                    />
                );
        }
    }

    // If not authenticated, show welcome screen with login/register options
    return (
        <ScrollView style={styles.scrollView}>
            <ThemedView variant="default" style={styles.container}>
                {/* Hero Section */}
                <ThemedView variant="default" style={styles.heroSection}>
                    <ThemedText style={styles.heroIcon}>🎓</ThemedText>
                    <ThemedText variant="default" size="xxl" weight="bold" style={styles.heroTitle}>
                        Welcome to eduLearn
                    </ThemedText>
                    <ThemedText variant="secondary" size="lg" style={styles.heroSubtitle}>
                        Your AI-Powered Learning Companion
                    </ThemedText>
                    <ThemedText variant="secondary" size="md" style={styles.heroDescription}>
                        Access thousands of courses, get personalized AI tutoring, and track your learning progress all in one place.
                    </ThemedText>
                </ThemedView>

                {/* Auth Buttons */}
                <ThemedView variant="default" style={styles.authSection}>
                    <Button
                        title="Sign In"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginButton}
                    />
                    <TouchableOpacity
                        style={[styles.registerButtonOutline, { borderColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <ThemedText variant="primary" size="md" weight="semibold">
                            Create Account
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* Features Section */}
                <ThemedView variant="default" style={styles.section}>
                    <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                        Why Choose eduLearn?
                    </ThemedText>

                    <ThemedView variant="surface" style={styles.featureCard}>
                        <ThemedText style={styles.featureIcon}>🤖</ThemedText>
                        <View style={styles.featureContent}>
                            <ThemedText variant="default" size="lg" weight="semibold">
                                AI-Powered Tutoring
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.featureDescription}>
                                Get instant help from our AI tutor, available 24/7 to answer your questions
                            </ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView variant="surface" style={styles.featureCard}>
                        <ThemedText style={styles.featureIcon}>📚</ThemedText>
                        <View style={styles.featureContent}>
                            <ThemedText variant="default" size="lg" weight="semibold">
                                Diverse Course Library
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.featureDescription}>
                                Access courses across multiple subjects taught by expert instructors
                            </ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView variant="surface" style={styles.featureCard}>
                        <ThemedText style={styles.featureIcon}>📊</ThemedText>
                        <View style={styles.featureContent}>
                            <ThemedText variant="default" size="lg" weight="semibold">
                                Track Your Progress
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.featureDescription}>
                                Monitor your learning journey with detailed analytics and insights
                            </ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView variant="surface" style={styles.featureCard}>
                        <ThemedText style={styles.featureIcon}>🎯</ThemedText>
                        <View style={styles.featureContent}>
                            <ThemedText variant="default" size="lg" weight="semibold">
                                Personalized Learning
                            </ThemedText>
                            <ThemedText variant="secondary" size="sm" style={styles.featureDescription}>
                                Get course recommendations tailored to your interests and goals
                            </ThemedText>
                        </View>
                    </ThemedView>
                </ThemedView>

                {/* CTA Section */}
                <ThemedView variant="surface" style={styles.ctaCard}>
                    <ThemedText variant="default" size="xl" weight="bold" style={styles.ctaTitle}>
                        Ready to Start Learning?
                    </ThemedText>
                    <ThemedText variant="secondary" size="md" style={styles.ctaDescription}>
                        Join thousands of learners already improving their skills
                    </ThemedText>
                    <Button
                        title="Get Started Free"
                        onPress={() => navigation.navigate('Register')}
                        style={styles.ctaButton}
                    />
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    heroIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    heroTitle: {
        textAlign: 'center',
        marginBottom: 12,
    },
    heroSubtitle: {
        textAlign: 'center',
        marginBottom: 16,
    },
    heroDescription: {
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 400,
    },
    authSection: {
        marginTop: 32,
        marginBottom: 48,
        paddingHorizontal: 20,
    },
    loginButton: {
        marginBottom: 12,
    },
    registerButtonOutline: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        marginBottom: 8,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 20,
        textAlign: 'center',
    },
    featureCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    featureIcon: {
        fontSize: 40,
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureDescription: {
        marginTop: 6,
        lineHeight: 20,
    },
    ctaCard: {
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    ctaTitle: {
        textAlign: 'center',
        marginBottom: 12,
    },
    ctaDescription: {
        textAlign: 'center',
        marginBottom: 24,
    },
    ctaButton: {
        minWidth: 200,
    },
});

export default HomeScreen;
