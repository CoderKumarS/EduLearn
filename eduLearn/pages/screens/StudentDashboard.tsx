import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { courseService } from '../services/courseService';
import { Course, Enrollment, Progress, calculateProgressPercent } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface StudentDashboardProps {
  onNavigateBack: () => void;
  onNavigateToCourse: (courseId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateBack,
  onNavigateToCourse,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [enrollmentsData, progressData] = await Promise.all([
        courseService.getEnrollments(),
        courseService.getProgress(),
      ]);
      
      // Filter for current student's data
      const studentEnrollments = enrollmentsData.filter(
        enrollment => enrollment.student.id === authState.user?.id
      );
      const studentProgress = progressData.filter(
        prog => prog.student === authState.user?.id
      );
      
      setEnrollments(studentEnrollments);
      setProgress(studentProgress);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn('Failed to load student data:', apiError.message);
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

  const getProgressForCourse = (courseId: string) => {
    return progress.find(prog => prog.course === courseId);
  };

  const calculateOverallProgress = () => {
    if (progress.length === 0) return 0;
    const totalScore = progress.reduce((sum, prog) => sum + prog.score, 0);
    return Math.round(totalScore / progress.length);
  };

  const renderCourseCard = (enrollment: Enrollment) => {
    const courseProgress = getProgressForCourse(enrollment.course.id);
    const progressPercent = courseProgress ? calculateProgressPercent(courseProgress) : 0;

    return (
      <TouchableOpacity
        key={enrollment.id}
        style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
        onPress={() => onNavigateToCourse(enrollment.course.id)}
      >
        <View style={styles.courseHeader}>
          <ThemedText style={styles.courseTitle} numberOfLines={2}>
            {enrollment.course.title}
          </ThemedText>
          <ThemedText variant="secondary" style={styles.instructor}>
            {enrollment.course.instructor.username}
          </ThemedText>
        </View>

        {courseProgress && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText variant="secondary" style={styles.progressLabel}>
                Progress
              </ThemedText>
              <ThemedText style={styles.progressPercent}>
                {Math.round(progressPercent)}%
              </ThemedText>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: `${progressPercent}%`,
                  }
                ]}
              />
            </View>

            <View style={styles.progressStats}>
              <ThemedText variant="secondary" style={styles.progressStat}>
                Score: {courseProgress.score}%
              </ThemedText>
              <ThemedText variant="secondary" style={styles.progressStat}>
                Lessons: {courseProgress.completed_lessons}/{courseProgress.total_lessons}
              </ThemedText>
            </View>
          </View>
        )}

        <ThemedText variant="secondary" style={styles.enrolledDate}>
          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <ThemedText style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Student Dashboard</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.content}>
          {/* Overview Stats */}
          <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.statsTitle}>Learning Overview</ThemedText>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{enrollments.length}</ThemedText>
                <ThemedText variant="secondary" style={styles.statLabel}>
                  Enrolled Courses
                </ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{calculateOverallProgress()}%</ThemedText>
                <ThemedText variant="secondary" style={styles.statLabel}>
                  Average Score
                </ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {progress.reduce((sum, prog) => sum + prog.completed_lessons, 0)}
                </ThemedText>
                <ThemedText variant="secondary" style={styles.statLabel}>
                  Lessons Completed
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Enrolled Courses */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>My Courses</ThemedText>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ThemedText>Loading your courses...</ThemedText>
              </View>
            ) : enrollments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  You haven't enrolled in any courses yet.
                </ThemedText>
                <ThemedText variant="secondary" style={styles.emptySubtext}>
                  Browse available courses to start learning!
                </ThemedText>
              </View>
            ) : (
              <View style={styles.coursesList}>
                {enrollments.map(renderCourseCard)}
              </View>
            )}
          </View>

          {/* Recent Activity */}
          {progress.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.sectionTitle}>Recent Progress</ThemedText>
              
              <View style={styles.activityList}>
                {progress.slice(0, 3).map((prog) => {
                  const enrollment = enrollments.find(e => e.course.id === prog.course);
                  if (!enrollment) return null;
                  
                  return (
                    <View key={prog.id} style={styles.activityItem}>
                      <View style={styles.activityInfo}>
                        <ThemedText style={styles.activityCourse}>
                          {enrollment.course.title}
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.activityScore}>
                          Latest Score: {prog.score}%
                        </ThemedText>
                      </View>
                      <View style={styles.activityProgress}>
                        <ThemedText style={styles.activityPercent}>
                          {Math.round(calculateProgressPercent(prog))}%
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
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
  courseHeader: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    fontSize: 12,
  },
  enrolledDate: {
    fontSize: 12,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityCourse: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityScore: {
    fontSize: 14,
  },
  activityProgress: {
    alignItems: 'flex-end',
  },
  activityPercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});