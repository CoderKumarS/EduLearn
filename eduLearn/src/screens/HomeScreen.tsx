import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { courseService } from '../services/courseService';
import { Course, Enrollment } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface HomeScreenProps {
  onNavigateToCourses: () => void;
  onNavigateToProfile: () => void;
  onNavigateToCourse: (courseId: string) => void;
  onNavigateToStudentDashboard?: () => void;
  onNavigateToInstructorDashboard?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCourses,
  onNavigateToProfile,
  onNavigateToCourse,
  onNavigateToStudentDashboard,
  onNavigateToInstructorDashboard,
}) => {
  const { authState, logout } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        courseService.getCourses(),
        courseService.getEnrollments(),
      ]);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn('Failed to load data:', apiError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await logout();
  };

  const enrolledCourses = enrollments.map(enrollment => enrollment.course);
  const availableCourses = courses.filter(
    course => !enrolledCourses.some(enrolled => enrolled.id === course.id)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.greeting}>
                Welcome back,
              </ThemedText>
              <ThemedText style={styles.username}>
                {authState.user?.username}!
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: theme.colors.primary }]}
              onPress={onNavigateToProfile}
            >
              <ThemedText style={styles.profileButtonText}>
                {authState.user?.username.charAt(0).toUpperCase()}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button
              title="Browse Courses"
              onPress={onNavigateToCourses}
              style={styles.actionButton}
            />
            {authState.user?.role === 'student' && (
              <Button
                title="Student Dashboard"
                variant="outline"
                onPress={onNavigateToStudentDashboard}
                style={styles.actionButton}
              />
            )}
            {authState.user?.role === 'instructor' && (
              <Button
                title="Instructor Dashboard"
                variant="outline"
                onPress={onNavigateToInstructorDashboard}
                style={styles.actionButton}
              />
            )}
          </View>

          {/* Enrolled Courses */}
          {enrolledCourses.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>My Courses</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.courseList}>
                  {enrolledCourses.map((course) => (
                    <TouchableOpacity
                      key={course.id}
                      style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => onNavigateToCourse(course.id)}
                    >
                      <ThemedText style={styles.courseTitle} numberOfLines={2}>
                        {course.title}
                      </ThemedText>
                      <ThemedText variant="secondary" style={styles.courseInstructor}>
                        by {course.instructor.username}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Available Courses */}
          {availableCourses.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Discover New Courses</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.courseList}>
                  {availableCourses.slice(0, 5).map((course) => (
                    <TouchableOpacity
                      key={course.id}
                      style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => onNavigateToCourse(course.id)}
                    >
                      <ThemedText style={styles.courseTitle} numberOfLines={2}>
                        {course.title}
                      </ThemedText>
                      <ThemedText variant="secondary" style={styles.courseInstructor}>
                        by {course.instructor.username}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.statNumber}>{enrolledCourses.length}</ThemedText>
              <ThemedText variant="secondary" style={styles.statLabel}>
                Enrolled Courses
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.statNumber}>{courses.length}</ThemedText>
              <ThemedText variant="secondary" style={styles.statLabel}>
                Total Courses
              </ThemedText>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <Button
              title="Logout"
              variant="outline"
              onPress={handleLogout}
            />
          </View>
        </ThemedView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  courseList: {
    flexDirection: 'row',
    gap: 16,
  },
  courseCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  logoutContainer: {
    paddingTop: 16,
  },
});