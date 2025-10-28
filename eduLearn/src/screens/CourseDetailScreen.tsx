import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { courseService } from '../services/courseService';
import { Course, Quiz, Enrollment } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface CourseDetailScreenProps {
  courseId: string;
  onNavigateBack: () => void;
  onNavigateToQuiz: (quizId: string) => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  courseId,
  onNavigateBack,
  onNavigateToQuiz,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseData, quizzesData, enrollmentsData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getQuizzes(),
        courseService.getEnrollments(),
      ]);
      
      setCourse(courseData);
      // Filter quizzes for this course
      const courseQuizzes = quizzesData.filter(quiz => quiz.course === courseId);
      setQuizzes(courseQuizzes);
      setEnrollments(enrollmentsData);
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = () => {
    return enrollments.some(enrollment => 
      enrollment.course.id === courseId && 
      enrollment.student.id === authState.user?.id
    );
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    setEnrolling(true);
    try {
      const enrollment = await courseService.enrollInCourse(courseId);
      setEnrollments(prev => [...prev, enrollment]);
      Alert.alert('Success', 'Successfully enrolled in the course!');
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading course details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <ThemedText>Course not found.</ThemedText>
          <Button title="Go Back" onPress={onNavigateBack} />
        </View>
      </SafeAreaView>
    );
  }

  const enrolled = isEnrolled();
  const isInstructor = authState.user?.role === 'instructor';
  const isOwnCourse = course.instructor.id === authState.user?.id;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <ThemedText style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          {/* Course Info */}
          <View style={[styles.courseInfo, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
            <ThemedText variant="secondary" style={styles.instructor}>
              Instructor: {course.instructor.username}
            </ThemedText>
            <ThemedText variant="secondary" style={styles.createdDate}>
              Created: {new Date(course.created_at).toLocaleDateString()}
            </ThemedText>
          </View>

          {/* Course Description */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            <ThemedText style={styles.description}>{course.description}</ThemedText>
          </View>

          {/* Enrollment Status */}
          {authState.user?.role === 'student' && !isOwnCourse && (
            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.sectionTitle}>Enrollment</ThemedText>
              {enrolled ? (
                <View style={styles.enrolledStatus}>
                  <ThemedText style={[styles.enrolledText, { color: theme.colors.success }]}>
                    ✓ You are enrolled in this course
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.enrollmentActions}>
                  <ThemedText style={styles.enrollmentText}>
                    Enroll in this course to access quizzes and track your progress.
                  </ThemedText>
                  <Button
                    title="Enroll Now"
                    onPress={handleEnroll}
                    loading={enrolling}
                    style={styles.enrollButton}
                  />
                </View>
              )}
            </View>
          )}

          {/* Quizzes */}
          {(enrolled || isInstructor) && (
            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.sectionTitle}>
                Quizzes ({quizzes.length})
              </ThemedText>
              
              {quizzes.length === 0 ? (
                <ThemedText variant="secondary" style={styles.noQuizzes}>
                  No quizzes available for this course yet.
                </ThemedText>
              ) : (
                <View style={styles.quizzesList}>
                  {quizzes.map((quiz) => (
                    <TouchableOpacity
                      key={quiz.id}
                      style={[styles.quizCard, { backgroundColor: theme.colors.surface }]}
                      onPress={() => onNavigateToQuiz(quiz.id)}
                    >
                      <View style={styles.quizHeader}>
                        <ThemedText style={styles.quizTitle}>{quiz.title}</ThemedText>
                        <ThemedText variant="secondary" style={styles.quizTime}>
                          {quiz.time_limit} min
                        </ThemedText>
                      </View>
                      <ThemedText variant="secondary" style={styles.quizDate}>
                        Created: {new Date(quiz.created_at).toLocaleDateString()}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Course Stats */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Course Statistics</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{quizzes.length}</ThemedText>
                <ThemedText variant="secondary" style={styles.statLabel}>Quizzes</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {enrollments.filter(e => e.course.id === courseId).length}
                </ThemedText>
                <ThemedText variant="secondary" style={styles.statLabel}>Students</ThemedText>
              </View>
            </View>
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
  header: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  courseInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructor: {
    fontSize: 16,
    marginBottom: 4,
  },
  createdDate: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  enrolledStatus: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  enrolledText: {
    fontSize: 16,
    fontWeight: '600',
  },
  enrollmentActions: {
    alignItems: 'center',
    gap: 16,
  },
  enrollmentText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  enrollButton: {
    minWidth: 120,
  },
  noQuizzes: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  quizzesList: {
    gap: 12,
  },
  quizCard: {
    padding: 16,
    borderRadius: 8,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  quizTime: {
    fontSize: 14,
    marginLeft: 8,
  },
  quizDate: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
});