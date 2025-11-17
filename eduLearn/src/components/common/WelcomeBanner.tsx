import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeBannerProps {
    userName: string;
    enrolledCourses?: number;
    completedCourses?: number;
    currentStreak?: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    userName,
    enrolledCourses = 0,
    completedCourses = 0,
    currentStreak = 0,
}) => {
    const { theme } = useTheme();

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.userName}>{userName}! 👋</Text>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="book-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.statValue}>{enrolledCourses}</Text>
                        <Text style={styles.statLabel}>Enrolled</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.statValue}>{completedCourses}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Ionicons name="flame-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.statValue}>{currentStreak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    content: {
        padding: 20,
    },
    greetingContainer: {
        marginBottom: 16,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});
