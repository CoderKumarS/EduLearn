import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { Button } from '../components/common/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

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

    // If authenticated, show simple home overview (not full dashboard)
    if (Boolean(isAuthenticated) && user) {
        return (
            <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
                <View style={styles.container}>
                    {/* Welcome Header */}
                    <View style={[styles.heroSection, { backgroundColor: theme.colors.primary }]}>
                        <View style={styles.welcomeHeader}>
                            <View>
                                <ThemedText style={[styles.welcomeText, { color: '#FFFFFFCC' }]}>
                                    Welcome back,
                                </ThemedText>
                                <ThemedText style={[styles.heroTitle, { color: '#FFFFFF' }]}>
                                    {user.username}!
                                </ThemedText>
                            </View>
                            {user.profile_image && (
                                <Image
                                    source={{ uri: user.profile_image }}
                                    style={styles.profileImageSmall}
                                />
                            )}
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.quickStatsSection}>
                        <ThemedText style={styles.quickStatsTitle}>Quick Overview</ThemedText>
                        <ThemedText variant="secondary" style={styles.sectionSubtitle}>
                            View your detailed analytics in the Dashboard tab
                        </ThemedText>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
                            onPress={() => {/* Navigation handled by tab bar */ }}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="book-outline" size={32} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={styles.actionTitle}>Browse Courses</ThemedText>
                            <ThemedText variant="secondary" style={styles.actionDescription}>
                                Explore available courses
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
                            onPress={() => {/* Navigation handled by tab bar */ }}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="stats-chart-outline" size={32} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={styles.actionTitle}>View Dashboard</ThemedText>
                            <ThemedText variant="secondary" style={styles.actionDescription}>
                                See your detailed progress
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    // If not authenticated, show welcome screen with login/register options
    return (
        <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                {/* Hero Section */}
                <View style={[styles.heroSection, { backgroundColor: theme.colors.primary }]}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF20' }]}>
                        <Ionicons name="school-outline" size={48} color="#FFFFFF" />
                    </View>
                    <ThemedText style={[styles.heroTitle, { color: '#FFFFFF' }]}>
                        Welcome to eduLearn
                    </ThemedText>
                    <ThemedText style={[styles.heroSubtitle, { color: '#FFFFFFCC' }]}>
                        Your AI-Powered Learning Platform
                    </ThemedText>
                </View>

                {/* Auth Buttons */}
                <View style={styles.authSection}>
                    <Button
                        title="Sign In"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginButton}
                    />
                    <TouchableOpacity
                        style={[styles.registerButtonOutline, { borderColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <ThemedText style={[styles.registerButtonText, { color: theme.colors.primary }]}>
                            Create Account
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <ThemedText style={styles.featuresTitle}>
                        Why Choose eduLearn?
                    </ThemedText>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText style={styles.featureTitle}>
                                AI-Powered Tutoring
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.featureDescription}>
                                Get instant help from our AI tutor, available 24/7
                            </ThemedText>
                        </View>
                    </View>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="library-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText style={styles.featureTitle}>
                                Diverse Course Library
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.featureDescription}>
                                Access courses across multiple subjects
                            </ThemedText>
                        </View>
                    </View>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="stats-chart-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText style={styles.featureTitle}>
                                Track Your Progress
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.featureDescription}>
                                Monitor your learning with detailed analytics
                            </ThemedText>
                        </View>
                    </View>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="bulb-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText style={styles.featureTitle}>
                                Personalized Learning
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.featureDescription}>
                                Get recommendations tailored to your goals
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* CTA Section */}
                <View style={[styles.ctaCard, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="rocket-outline" size={48} color={theme.colors.primary} />
                    <ThemedText style={styles.ctaTitle}>
                        Ready to Start Learning?
                    </ThemedText>
                    <ThemedText variant="secondary" style={styles.ctaDescription}>
                        Join thousands of learners improving their skills
                    </ThemedText>
                    <Button
                        title="Get Started Free"
                        onPress={() => navigation.navigate('Register')}
                        style={styles.ctaButton}
                    />
                </View>
            </View>
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
    },
    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    // Auth Section
    authSection: {
        paddingHorizontal: 20,
        paddingVertical: 32,
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
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Features Section
    featuresSection: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    featuresTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
    },
    featureCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    // CTA Section
    ctaCard: {
        marginHorizontal: 20,
        marginBottom: 32,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ctaTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    ctaDescription: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
    },
    ctaButton: {
        minWidth: 200,
    },
    // Authenticated user home styles
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 16,
        marginBottom: 4,
    },
    profileImageSmall: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    quickStatsSection: {
        padding: 20,
    },
    quickStatsTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    actionsSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    actionCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionDescription: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default HomeScreen;
