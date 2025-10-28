import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { courseService } from '../services/courseService';
import { Course, Enrollment, Quiz } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface InstructorDashboardProps {
  onNavigateBack: () => void;
  onNavigateToCourse: (courseId: string) => void;
  onCreateCourse: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  onNavigateBack,
  onNavigateToCourse,
  onCreateCourse,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData, quizzesData] = await Promise.all([
        courseService.getCourses(),
        courseService.getEnrollments(),
        courseService.getQuizzes(),
      ]);
      
      // Filter for current instructor's courses
      const instructorCourses = coursesData.filter(
        course => course.instructor.id === authState.user?.id
      );
      
      setCourses(instructorCourses);
      setEnrollments(enrollmentsData);
      setQuizzes(quizzesData);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn('Failed to load instructor data:', apiError.message);
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

  const getEnrollmentsForCourse = (courseId: string) => {
    return enrollments.filter(enrollment => enrollment.course.id === courseId);
  };

  const getQuizzesForCourse = (courseId: string) => {
    return quizzes.filter(quiz => quiz.course === courseId);
  };

  const getTotalStudents = () => {
    const courseIds = courses.map(course => course.id);
    return enrollments.filter(enrollment => 
      courseIds.includes(enrollment.course.id)
    ).length;
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await courseService.deleteCourse(courseId);
              setCourses(prev => prev.filter(course => course.id !== courseId));
              Alert.alert('Success', 'Course deleted successfully');
            } catch (error) {
              const apiError = handleApiError(error);
              Alert.alert('Error', apiError.message);
            }
          },
        },
      ]
    );
  };

  const renderCourseCard = (course: Course) => {
    const courseEnrollments = getEnrollmentsForCourse(course.id);
    const courseQuizzes = getQuizzesForCourse(course.id);

    return (
      <TouchableOpacity
        key={course.id}
        style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
        onPress={() => onNavigateToCourse(course.id)}
      >
        <View style={styles.courseHeader}>
          <ThemedText style={styles.courseTitle} numberOfLines={2}>
            {course.title}
          </ThemedText>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCourse(course.id, course.title)}
          >
            <ThemedText style={[styles.deleteButtonText, { color: theme.colors.error }]}>
              ×
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText variant="secondary" style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </ThemedText>

        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{courseEnrollments.length}</ThemedText>
            <ThemedText variant="secondary" style={styles.statLabel}>Students</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{courseQuizzes.length}</ThemedText>
            <ThemedText variant="secondary" style={styles.statLabel}>Quizzes</ThemedText>
          </View>
        </View>

        <ThemedText variant="secondary" style={styles.courseDate}>
          Created: {new Date(course.created_at).toLocaleDateString()}
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
        <ThemedText style={styles.headerTitle}>Instructor Dashboard</ThemedText>
        <TouchableOpacity onPress={onCreateCourse} style={styles.addButton}>
          <ThemedText style={[styles.addButtonText, { color: theme.colors.primary }]}>
            + Add
          </ThemedText>
        </TouchableOpacity>
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
            <ThemedText style={styles.statsTitle}>Teaching Overview</ThemedText>
            
            <View style={styles.statsGrid}>
              <View style={styles.overviewStatItem}>
                <ThemedText style={styles.overviewStatNumber}>{courses.length}</ThemedText>
                <ThemedText variant="secondary" style={styles.overviewStatLabel}>
                  My Courses
                </ThemedText>
              </View>
              
              <View style={styles.overviewStatItem}>
                <ThemedText style={styles.overviewStatNumber}>{getTotalStudents()}</ThemedText>
                <ThemedText variant="secondary" style={styles.overviewStatLabel}>
                  Total Students
                </ThemedText>
              </View>
              
              <View style={styles.overviewStatItem}>
                <ThemedText style={styles.overviewStatNumber}>
                  {quizzes.filter(quiz => 
                    courses.some(course => course.id === quiz.course)
                  ).length}
                </ThemedText>
                <ThemedText variant="secondary" style={styles.overviewStatLabel}>
                  Total Quizzes
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button
              title="Create New Course"
              onPress={onCreateCourse}
              style={styles.actionButton}
            />
          </View>

          {/* My Courses */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>My Courses</ThemedText>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ThemedText>Loading your courses...</ThemedText>
              </View>
            ) : courses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  You haven't created any courses yet.
                </ThemedText>
                <ThemedText variant="secondary" style={styles.emptySubtext}>
                  Create your first course to start teaching!
                </ThemedText>
                <Button
                  title="Create Course"
                  onPress={onCreateCourse}
                  style={styles.createButton}
                />
              </View>
            ) : (
              <View style={styles.coursesList}>
                {courses.map(renderCourseCard)}
              </View>
            )}
          </View>

          {/* Recent Activity */}
          {courses.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
              
              <View style={styles.activityList}>
                {courses.slice(0, 3).map((course) => {
                  const courseEnrollments = getEnrollmentsForCourse(course.id);
                  const recentEnrollment = courseEnrollments
                    .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())[0];
                  
                  return (
                    <View key={course.id} style={styles.activityItem}>
                      <View style={styles.activityInfo}>
                        <ThemedText style={styles.activityCourse}>
                          {course.title}
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.activityDetail}>
                          {recentEnrollment 
                            ? `Latest enrollment: ${recentEnrollment.student.username}`
                            : 'No recent activity'
                          }
                        </ThemedText>
                      </View>
                      <View style={styles.activityStats}>
                        <ThemedText style={styles.activityNumber}>
                          {courseEnrollments.length}
                        </ThemedText>
                        <ThemedText variant="secondary" style={styles.activityLabel}>
                          students
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
  addButton: {
    padding: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  overviewStatItem: {
    alignItems: 'center',
  },
  overviewStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 8,
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
    marginBottom: 24,
  },
  createButton: {
    minWidth: 140,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  courseDate: {
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
  activityDetail: {
    fontSize: 14,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityLabel: {
    fontSize: 12,
  },
});