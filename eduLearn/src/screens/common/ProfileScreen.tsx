import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ProfileHeader } from '../../components/common/ProfileHeader';
import { StatCard } from '../../components/common/StatCard';
import { QuickActionButton } from '../../components/common/QuickActionButton';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../services/profileService';
import { UserStats } from '../../types/profile';
import { handleApiError } from '../../utils/errorHandler';
import { LoadingScreen } from '../../components/common/LoadingScreen';

const ProfileScreen: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadUserStats();
            // Fade in animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isAuthenticated, user?.id]);

    const loadUserStats = async () => {
        if (!user?.id) return;

        try {
            setLoadingStats(true);
            setStatsError(null);
            const userStats = await profileService.getUserStats(Number(user.id), user.role);
            setStats(userStats);
        } catch (error) {
            const apiError = handleApiError(error);
            setStatsError(apiError.message);
            console.error('Failed to load user stats:', apiError.message);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadUserStats();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <ThemedView variant="default" style={styles.container}>
                <View style={styles.unauthenticatedContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
                        <Ionicons name="person-outline" size={64} color={theme.colors.textSecondary} />
                    </View>
                    <ThemedText variant="default" size="xxl" weight="bold" style={styles.unauthTitle}>
                        Welcome to eduLearn
                    </ThemedText>
                    <ThemedText variant="secondary" size="md" style={styles.unauthSubtitle}>
                        Sign in to access your profile, courses, and track your learning progress
                    </ThemedText>
                    <View style={styles.authButtons}>
                        <Button
                            title="Sign In"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.loginButton}
                        />
                        <TouchableOpacity
                            style={[styles.registerButton, { borderColor: theme.colors.primary, borderWidth: 2 }]}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <ThemedText variant="primary" size="md" weight="semibold">
                                Create Account
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        );
    }

    if (!user) {
        return <LoadingScreen message="Loading profile..." />;
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Custom Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <ThemedText variant="default" size="xl" weight="bold">
                    Profile
                </ThemedText>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <ThemedView variant="default" style={styles.container}>
                        {/* Profile Header */}
                        <ProfileHeader user={user} />

                        {/* Statistics Section */}
                        <ThemedView variant="default" style={styles.section}>
                            <ThemedText variant="default" size="lg" weight="bold" style={styles.sectionTitle}>
                                {user?.role === 'instructor' ? 'Teaching Statistics' : 'Learning Statistics'}
                            </ThemedText>
                            {loadingStats ? (
                                <View style={styles.statsLoadingContainer}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                    <ThemedText variant="secondary" size="sm" style={styles.loadingText}>
                                        Loading statistics...
                                    </ThemedText>
                                </View>
                            ) : statsError ? (
                                <View style={styles.statsErrorContainer}>
                                    <ThemedText variant="secondary" size="sm" style={styles.errorText}>
                                        {statsError}
                                    </ThemedText>
                                    <TouchableOpacity onPress={loadUserStats}>
                                        <ThemedText variant="primary" size="sm" weight="semibold">
                                            Retry
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.statsContainer}
                                >
                                    {user?.role === 'instructor' ? (
                                        <>
                                            <StatCard
                                                label="Courses Created"
                                                value={stats?.coursesCreated || 0}
                                                icon={<Ionicons name="book-outline" size={24} color="#3B82F6" />}
                                                accentColor="#3B82F6"
                                            />
                                            <StatCard
                                                label="Total Students"
                                                value={stats?.totalStudents || 0}
                                                icon={<Ionicons name="people-outline" size={24} color="#10B981" />}
                                                accentColor="#10B981"
                                            />
                                            <StatCard
                                                label="Total Enrollments"
                                                value={stats?.totalEnrollments || 0}
                                                icon={<Ionicons name="school-outline" size={24} color="#F59E0B" />}
                                                accentColor="#F59E0B"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <StatCard
                                                label="Enrolled Courses"
                                                value={stats?.coursesEnrolled || 0}
                                                icon={<Ionicons name="book-outline" size={24} color="#3B82F6" />}
                                                accentColor="#3B82F6"
                                            />
                                            <StatCard
                                                label="Completed Courses"
                                                value={stats?.coursesCompleted || 0}
                                                icon={<Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />}
                                                accentColor="#10B981"
                                            />
                                            <StatCard
                                                label="Learning Streak"
                                                value={`${stats?.streak || 0} days`}
                                                icon={<Ionicons name="flame-outline" size={24} color="#F59E0B" />}
                                                accentColor="#F59E0B"
                                            />
                                        </>
                                    )}
                                </ScrollView>
                            )}
                        </ThemedView>

                        {/* Quick Actions */}
                        <ThemedView variant="default" style={styles.section}>
                            <ThemedText variant="default" size="lg" weight="bold" style={styles.sectionTitle}>
                                Quick Actions
                            </ThemedText>
                            <View style={styles.quickActionsGrid}>
                                <QuickActionButton
                                    icon="settings-outline"
                                    label="Settings"
                                    onPress={() => navigation.navigate('ProfileSettings')}
                                    iconColor="#3B82F6"
                                />
                                <QuickActionButton
                                    icon="ribbon-outline"
                                    label="Certificates"
                                    onPress={() => {
                                        // Navigate to Certificates screen (to be created)
                                        console.log('Navigate to Certificates');
                                    }}
                                    iconColor="#10B981"
                                />
                                <QuickActionButton
                                    icon="trophy-outline"
                                    label="Achievements"
                                    onPress={() => {
                                        // Navigate to Achievements screen (to be created)
                                        console.log('Navigate to Achievements');
                                    }}
                                    iconColor="#F59E0B"
                                />
                                <QuickActionButton
                                    icon="help-circle-outline"
                                    label="Help & Support"
                                    onPress={() => navigation.navigate('ContactUs')}
                                    iconColor="#8B5CF6"
                                />
                            </View>
                        </ThemedView>

                        {/* Theme Settings */}
                        <ThemedView variant="default" style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <ThemedText variant="default" size="lg" weight="bold">
                                    Appearance
                                </ThemedText>
                                <ThemedText variant="secondary" size="sm" style={styles.sectionSubtitle}>
                                    Customize your viewing experience
                                </ThemedText>
                            </View>

                            <ThemedView variant="surface" style={styles.themeCard}>
                                <View style={styles.themeButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.themeButton,
                                            theme.mode === 'light' && styles.themeButtonActive,
                                            {
                                                backgroundColor: theme.mode === 'light'
                                                    ? theme.colors.primary + '10'
                                                    : theme.colors.background,
                                                borderWidth: 2,
                                                borderColor: theme.mode === 'light'
                                                    ? theme.colors.primary
                                                    : theme.colors.border,
                                            },
                                        ]}
                                        onPress={setLightTheme}
                                        accessibilityRole="button"
                                        accessibilityLabel="Light theme"
                                        accessibilityState={{ selected: theme.mode === 'light' }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.themeIconCircle,
                                            {
                                                backgroundColor: theme.mode === 'light'
                                                    ? theme.colors.primary
                                                    : theme.colors.surface
                                            }
                                        ]}>
                                            <Ionicons
                                                name="sunny"
                                                size={24}
                                                color={theme.mode === 'light' ? '#FFFFFF' : theme.colors.textSecondary}
                                            />
                                        </View>
                                        <ThemedText
                                            size="sm"
                                            weight={theme.mode === 'light' ? 'bold' : 'semibold'}
                                            style={[
                                                styles.themeButtonLabel,
                                                { color: theme.mode === 'light' ? theme.colors.primary : theme.colors.text },
                                            ]}
                                        >
                                            Light
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.themeButton,
                                            theme.mode === 'dark' && styles.themeButtonActive,
                                            {
                                                backgroundColor: theme.mode === 'dark'
                                                    ? theme.colors.primary + '10'
                                                    : theme.colors.background,
                                                borderWidth: 2,
                                                borderColor: theme.mode === 'dark'
                                                    ? theme.colors.primary
                                                    : theme.colors.border,
                                            },
                                        ]}
                                        onPress={setDarkTheme}
                                        accessibilityRole="button"
                                        accessibilityLabel="Dark theme"
                                        accessibilityState={{ selected: theme.mode === 'dark' }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.themeIconCircle,
                                            {
                                                backgroundColor: theme.mode === 'dark'
                                                    ? theme.colors.primary
                                                    : theme.colors.surface
                                            }
                                        ]}>
                                            <Ionicons
                                                name="moon"
                                                size={24}
                                                color={theme.mode === 'dark' ? '#FFFFFF' : theme.colors.textSecondary}
                                            />
                                        </View>
                                        <ThemedText
                                            size="sm"
                                            weight={theme.mode === 'dark' ? 'bold' : 'semibold'}
                                            style={[
                                                styles.themeButtonLabel,
                                                { color: theme.mode === 'dark' ? theme.colors.primary : theme.colors.text },
                                            ]}
                                        >
                                            Dark
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.themeButton,
                                            theme.mode === 'system' && styles.themeButtonActive,
                                            {
                                                backgroundColor: theme.mode === 'system'
                                                    ? theme.colors.primary + '10'
                                                    : theme.colors.background,
                                                borderWidth: 2,
                                                borderColor: theme.mode === 'system'
                                                    ? theme.colors.primary
                                                    : theme.colors.border,
                                            },
                                        ]}
                                        onPress={setSystemTheme}
                                        accessibilityRole="button"
                                        accessibilityLabel="System theme"
                                        accessibilityState={{ selected: theme.mode === 'system' }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.themeIconCircle,
                                            {
                                                backgroundColor: theme.mode === 'system'
                                                    ? theme.colors.primary
                                                    : theme.colors.surface
                                            }
                                        ]}>
                                            <Ionicons
                                                name="phone-portrait-outline"
                                                size={24}
                                                color={theme.mode === 'system' ? '#FFFFFF' : theme.colors.textSecondary}
                                            />
                                        </View>
                                        <ThemedText
                                            size="sm"
                                            weight={theme.mode === 'system' ? 'bold' : 'semibold'}
                                            style={[
                                                styles.themeButtonLabel,
                                                { color: theme.mode === 'system' ? theme.colors.primary : theme.colors.text },
                                            ]}
                                        >
                                            Auto
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>
                        </ThemedView>

                        {/* Logout Button */}
                        <ThemedView variant="default" style={styles.section}>
                            <TouchableOpacity
                                style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
                                onPress={logout}
                                accessibilityRole="button"
                                accessibilityLabel="Logout"
                                accessibilityHint="Tap to sign out of your account"
                            >
                                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
                                <ThemedText size="md" weight="semibold" style={styles.logoutText}>
                                    Logout
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
    },
    statsLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 12,
    },
    loadingText: {
        marginLeft: 8,
    },
    statsErrorContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        marginTop: 4,
    },
    bioInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    infoCard: {
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        marginBottom: 8,
    },
    editButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionSubtitle: {
        opacity: 0.8,
    },
    themeCard: {
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    themeButtons: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    themeButton: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
    },
    themeButtonActive: {
        transform: [{ scale: 1.02 }],
    },
    themeIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    themeButtonLabel: {
        textAlign: 'center',
        marginTop: 4,
    },
    activeIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutIcon: {
        marginRight: 4,
    },
    logoutText: {
        color: '#FFFFFF',
    },
    unauthenticatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    unauthTitle: {
        marginBottom: 12,
        textAlign: 'center',
    },
    unauthSubtitle: {
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    authButtons: {
        width: '100%',
        gap: 12,
    },
    loginButton: {
        width: '100%',
    },
    registerButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ProfileScreen;
