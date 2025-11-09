import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedText } from '../components';
import { NavigationCard } from '../components/NavigationCard';

interface HomeScreenProps {
  onNavigateToCourses: () => void;
  onNavigateToProfile: () => void;
  onNavigateToCourse: (courseId: string) => void;
  onNavigateToStudentDashboard?: () => void;
  onNavigateToInstructorDashboard?: () => void;
  onNavigateToAdminDashboard?: () => void;
  onNavigateToAITutor?: () => void;
  onNavigateToAboutUs?: () => void;
  onNavigateToContactUs?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCourses,
  onNavigateToProfile,
  onNavigateToStudentDashboard,
  onNavigateToInstructorDashboard,
  onNavigateToAdminDashboard,
  onNavigateToAITutor,
  onNavigateToAboutUs,
  onNavigateToContactUs,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={[styles.banner, { borderRadius: theme.borderRadius.lg }]}
        >
          <Ionicons name="school" size={48} color="#FFFFFF" />
          <ThemedText style={[styles.bannerTitle, theme.typography.h1]}>
            Welcome to AI LearnHub!
          </ThemedText>
          <ThemedText style={[styles.bannerSubtitle, theme.typography.body]}>
            Your personalized journey to knowledge and skill mastery begins here.
          </ThemedText>
        </LinearGradient>

        {/* Your Dashboards Section */}
        <View style={[styles.section, { marginTop: theme.spacing.lg }]}>
          <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
            Your Dashboards
          </ThemedText>

          <NavigationCard
            icon={<Ionicons name="person" size={24} color="#FFFFFF" />}
            title="Student Dashboard"
            description="Access enrolled courses, track progress, and interact with the AI Tutor."
            onPress={onNavigateToStudentDashboard || (() => { })}
            iconBackgroundColor={theme.colors.primary}
          />

          {authState.user?.role === 'instructor' && (
            <NavigationCard
              icon={<Ionicons name="book" size={24} color="#FFFFFF" />}
              title="Instructor Dashboard"
              description="Manage your created courses, view student statistics, and facilitate learning."
              onPress={onNavigateToInstructorDashboard || (() => { })}
              iconBackgroundColor="#9333EA"
            />
          )}

          {authState.user?.role === 'admin' && (
            <NavigationCard
              icon={<Ionicons name="settings" size={24} color="#FFFFFF" />}
              title="Admin Dashboard"
              description="Oversee user management, monitor course statistics, and maintain system health."
              onPress={onNavigateToAdminDashboard || (() => { })}
              iconBackgroundColor="#DC2626"
            />
          )}
        </View>

        {/* Explore & Learn Section */}
        <View style={[styles.section, { marginTop: theme.spacing.xl }]}>
          <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
            Explore & Learn
          </ThemedText>

          <NavigationCard
            icon={<Ionicons name="search" size={24} color="#FFFFFF" />}
            title="Course Explore"
            description="Discover a wide array of courses using filters and categories."
            onPress={onNavigateToCourses}
            iconBackgroundColor="#0891B2"
          />

          <NavigationCard
            icon={<Ionicons name="chatbubbles" size={24} color="#FFFFFF" />}
            title="AI Tutor"
            description="Get instant, AI-powered assistance for your learning queries and assignments."
            onPress={onNavigateToAITutor || (() => { })}
            iconBackgroundColor="#059669"
          />
        </View>

        {/* App Information Section */}
        <View style={[styles.section, { marginTop: theme.spacing.xl, marginBottom: theme.spacing.xxl }]}>
          <ThemedText style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text }]}>
            App Information
          </ThemedText>

          <NavigationCard
            icon={<Ionicons name="information-circle" size={24} color="#FFFFFF" />}
            title="About AI LearnHub"
            description="Learn about our mission, vision, and the dedicated team behind this platform."
            onPress={onNavigateToAboutUs || (() => { })}
            iconBackgroundColor="#7C3AED"
          />

          <NavigationCard
            icon={<Ionicons name="mail" size={24} color="#FFFFFF" />}
            title="Contact Us"
            description="Reach out for support, feedback, or partnership inquiries."
            onPress={onNavigateToContactUs || (() => { })}
            iconBackgroundColor="#EA580C"
          />
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
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
});
