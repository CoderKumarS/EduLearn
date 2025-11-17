import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { WelcomeBanner } from '../../components/common/WelcomeBanner';
import { SearchBar } from '../../components/common/SearchBar';
import { ContinueLearningSection } from '../../components/home/ContinueLearningSection';
import { PopularCoursesSection } from '../../components/home/PopularCoursesSection';
import { RecentlyJoinedSection } from '../../components/home/RecentlyJoinedSection';
import { CourseCategoriesSection } from '../../components/home/CourseCategoriesSection';
import { Button } from '../../components/common/Button';
import courseService from '../../services/courseService';
import cacheManager from '../../utils/cacheManager';

export const NewHomeScreen: React.FC = () => {
    const { theme } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    // Home data
    const [continueLearning, setContinueLearning] = useState<any[]>([]);
    const [popularCourses, setPopularCourses] = useState<any[]>([]);
    const [recentlyJoined, setRecentlyJoined] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Dashboard data
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
    const [errors, setErrors] = useState<{
        continueLearning?: string;
        popularCourses?: string;
        recentlyJoined?: string;
        categories?: string;
        dashboard?: string;
    }>({});

    useEffect(() => {
        // Only load data if user is authenticated
        if (isAuthenticated && user) {
            loadData();
        }
    }, [isAuthenticated, user]);

    const loadData = async (useCache: boolean = true) => {
        try {
            setLoading(true);
            setErrors({});

            // Try to load from cache first (stale-while-revalidate)
            if (useCache) {
                const cachedContinue = await cacheManager.getStale('continueLearning');
                const cachedPopular = await cacheManager.getStale('popularCourses');
                const cachedRecent = await cacheManager.getStale('recentlyJoined');
                const cachedCategories = await cacheManager.getStale('categories');
                const cachedDashboard = await cacheManager.getStale('dashboardStats');

                // Set stale data immediately for better UX
                if (cachedContinue.data) setContinueLearning(cachedContinue.data as any[]);
                if (cachedPopular.data) setPopularCourses(cachedPopular.data as any[]);
                if (cachedRecent.data) setRecentlyJoined(cachedRecent.data as any[]);
                if (cachedCategories.data) setCategories(cachedCategories.data as any[]);
                if (cachedDashboard.data) setDashboardStats(cachedDashboard.data as any);

                // If all data is fresh, skip API calls
                if (
                    !cachedContinue.isStale &&
                    !cachedPopular.isStale &&
                    !cachedRecent.isStale &&
                    !cachedCategories.isStale &&
                    !cachedDashboard.isStale
                ) {
                    setLoading(false);
                    return;
                }
            }

            // Load all data in parallel
            // Only load authenticated data if user is logged in
            const promises = [
                courseService.getPopularCourses(5),
                courseService.getCategories(),
            ];

            if (isAuthenticated && user) {
                promises.push(
                    courseService.getContinueLearning(),
                    courseService.getRecentlyJoined(5),
                    courseService.getDashboardStats()
                );
            }

            const results = await Promise.allSettled(promises);

            // Map results based on what was requested
            let resultIndex = 0;
            const popularData = results[resultIndex++];
            const categoriesData = results[resultIndex++];

            let continueData: any = { status: 'rejected' };
            let recentData: any = { status: 'rejected' };
            let dashboardData: any = { status: 'rejected' };

            if (isAuthenticated && user) {
                continueData = results[resultIndex++];
                recentData = results[resultIndex++];
                dashboardData = results[resultIndex++];
            }

            const newErrors: any = {};

            if (isAuthenticated && user) {
                if (continueData.status === 'fulfilled') {
                    setContinueLearning(continueData.value);
                    await cacheManager.set('continueLearning', continueData.value);
                } else {
                    newErrors.continueLearning = 'Failed to load continue learning courses';
                }
            }

            if (popularData.status === 'fulfilled') {
                setPopularCourses(popularData.value);
                await cacheManager.set('popularCourses', popularData.value);
            } else {
                newErrors.popularCourses = 'Failed to load popular courses';
            }

            if (isAuthenticated && user) {
                if (recentData.status === 'fulfilled') {
                    setRecentlyJoined(recentData.value);
                    await cacheManager.set('recentlyJoined', recentData.value);
                } else {
                    newErrors.recentlyJoined = 'Failed to load recently joined courses';
                }
            }

            if (categoriesData.status === 'fulfilled') {
                setCategories(categoriesData.value);
                await cacheManager.set('categories', categoriesData.value);
            } else {
                newErrors.categories = 'Failed to load categories';
            }

            if (isAuthenticated && user) {
                if (dashboardData.status === 'fulfilled') {
                    setDashboardStats(dashboardData.value);
                    await cacheManager.set('dashboardStats', dashboardData.value);
                } else {
                    console.error('Error loading dashboard stats:', dashboardData.status === 'rejected' ? dashboardData.reason : 'Unknown error');
                    newErrors.dashboard = 'Failed to load dashboard stats';
                }
            }

            setErrors(newErrors);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const retrySection = async (section: string) => {
        try {
            const newErrors = { ...errors };
            delete newErrors[section as keyof typeof errors];
            setErrors(newErrors);

            switch (section) {
                case 'continueLearning':
                    const continueData = await courseService.getContinueLearning();
                    setContinueLearning(continueData);
                    break;
                case 'popularCourses':
                    const popularData = await courseService.getPopularCourses(5);
                    setPopularCourses(popularData);
                    break;
                case 'recentlyJoined':
                    const recentData = await courseService.getRecentlyJoined(5);
                    setRecentlyJoined(recentData);
                    break;
                case 'categories':
                    const categoriesData = await courseService.getCategories();
                    setCategories(categoriesData);
                    break;
            }
        } catch (error) {
            console.error(`Error retrying ${section}:`, error);
            setErrors({
                ...errors,
                [section]: `Failed to load ${section}`,
            });
        }
    };

    const onRefresh = useCallback(async () => {
        if (isAuthenticated && user) {
            setRefreshing(true);
            await loadData(false); // Skip cache on manual refresh
            setRefreshing(false);
        }
    }, [isAuthenticated, user]);

    const handleSearch = (query: string) => {
        // Navigate to search results
        console.log('Search:', query);
    };

    const handleSearchFocus = () => {
        // Navigate to search screen
        console.log('Search focused');
    };

    const navigation = useNavigation<any>();

    // Show welcome screen for non-authenticated users
    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <View style={[styles.heroSection, { backgroundColor: theme.colors.primary }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF20' }]}>
                            <Ionicons name="school-outline" size={48} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>
                            Welcome to eduLearn
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: '#FFFFFFCC' }]}>
                            Your AI-Powered Learning Platform
                        </Text>
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
                            <Text style={[styles.registerButtonText, { color: theme.colors.primary }]}>
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresSection}>
                        <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
                            Why Choose eduLearn?
                        </Text>

                        <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                                    AI-Powered Tutoring
                                </Text>
                                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                                    Get instant help from our AI tutor, available 24/7
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="library-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                                    Diverse Course Library
                                </Text>
                                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                                    Access courses across multiple subjects
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="stats-chart-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                                    Track Your Progress
                                </Text>
                                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                                    Monitor your learning with detailed analytics
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="bulb-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                                    Personalized Learning
                                </Text>
                                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                                    Get recommendations tailored to your goals
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* CTA Section */}
                    <View style={[styles.ctaCard, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="rocket-outline" size={48} color={theme.colors.primary} />
                        <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>
                            Ready to Start Learning?
                        </Text>
                        <Text style={[styles.ctaDescription, { color: theme.colors.textSecondary }]}>
                            Join thousands of learners improving their skills
                        </Text>
                        <Button
                            title="Get Started Free"
                            onPress={() => navigation.navigate('Register')}
                            style={styles.ctaButton}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
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
                <View style={styles.topSection}>
                    <WelcomeBanner
                        userName={user?.username || 'Student'}
                        enrolledCourses={dashboardStats.enrolledCourses}
                        completedCourses={dashboardStats.completedCourses}
                        currentStreak={dashboardStats.currentStreak}
                    />
                </View>

                <SearchBar
                    onSearch={handleSearch}
                    onFocus={handleSearchFocus}
                />

                <ContinueLearningSection
                    courses={continueLearning}
                    isLoading={loading}
                    error={errors.continueLearning}
                    onRetry={() => retrySection('continueLearning')}
                />

                <PopularCoursesSection
                    courses={popularCourses}
                    isLoading={loading}
                    error={errors.popularCourses}
                    onRetry={() => retrySection('popularCourses')}
                />

                <RecentlyJoinedSection
                    courses={recentlyJoined}
                    isLoading={loading}
                    error={errors.recentlyJoined}
                    onRetry={() => retrySection('recentlyJoined')}
                />

                <CourseCategoriesSection
                    categories={categories}
                    isLoading={loading}
                    error={errors.categories}
                    onRetry={() => retrySection('categories')}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    topSection: {
        paddingTop: 16,
    },
    // Welcome screen styles
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
});
