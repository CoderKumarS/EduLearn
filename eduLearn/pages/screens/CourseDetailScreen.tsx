import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { ChapterItem } from '../components/ChapterItem';
import { courseService } from '../services/courseService';
import { Course, Quiz, Enrollment, Chapter } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

const { width } = Dimensions.get('window');

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
  const [bookmarked, setBookmarked] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

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

  const handleShare = async () => {
    if (!course) return;

    try {
      await Share.share({
        message: `Check out this course: ${course.title}\n${course.description}`,
        title: course.title,
      });
    } catch (error) {
      console.error('Error sharing course:', error);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Persist bookmark state to backend
    Alert.alert(
      bookmarked ? 'Bookmark Removed' : 'Bookmarked',
      bookmarked ? 'Course removed from bookmarks' : 'Course added to bookmarks'
    );
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
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
      {/* Header with Share and Bookmark */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.iconButton}
            accessibilityLabel="Share course"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBookmark}
            style={styles.iconButton}
            accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark course"}
            accessibilityRole="button"
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={bookmarked ? theme.colors.primary : theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Video Player Area */}
        <View style={[styles.videoContainer, { backgroundColor: theme.colors.surface }]}>
          {course.videoUrl ? (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={64} color={theme.colors.primary} />
              <ThemedText variant="secondary" style={styles.videoText}>
                Video Player
              </ThemedText>
              <ThemedText variant="secondary" style={styles.videoSubtext}>
                {course.videoUrl}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam-off-outline" size={64} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" style={styles.videoText}>
                No preview video available
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedView style={styles.content}>
          {/* Course Info */}
          <View style={styles.courseInfoSection}>
            <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
            <View style={styles.instructorRow}>
              <Ionicons name="person-circle-outline" size={20} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" style={styles.instructor}>
                {course.instructor.username}
              </ThemedText>
            </View>
            <ThemedText style={styles.description}>{course.description}</ThemedText>
          </View>

          {/* Course Chapters */}
          {course.chapters && course.chapters.length > 0 && (
            <View style={styles.chaptersSection}>
              <ThemedText style={styles.sectionTitle}>Course Chapters</ThemedText>
              {course.chapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  chapterNumber={chapter.number}
                  title={chapter.title}
                  contentType={chapter.contentType}
                  duration={chapter.duration}
                  isExpanded={expandedChapters.has(chapter.id)}
                  onToggle={() => toggleChapter(chapter.id)}
                >
                  {chapter.contentType === 'quiz' && chapter.quizId && (
                    <View style={styles.chapterContent}>
                      <ThemedText variant="secondary" style={styles.chapterDescription}>
                        Test your knowledge with this quiz
                      </ThemedText>
                      <Button
                        title="Start Quiz"
                        onPress={() => onNavigateToQuiz(chapter.quizId!)}
                        style={styles.startQuizButton}
                      />
                    </View>
                  )}
                  {chapter.contentType === 'video' && chapter.videoUrl && (
                    <View style={styles.chapterContent}>
                      <ThemedText variant="secondary" style={styles.chapterDescription}>
                        Video lesson
                      </ThemedText>
                    </View>
                  )}
                  {chapter.contentType === 'reading' && (
                    <View style={styles.chapterContent}>
                      <ThemedText variant="secondary" style={styles.chapterDescription}>
                        Reading material
                      </ThemedText>
                    </View>
                  )}
                </ChapterItem>
              ))}
            </View>
          )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  videoContainer: {
    width: width,
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoText: {
    fontSize: 16,
    marginTop: 8,
  },
  videoSubtext: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  courseInfoSection: {
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 32,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  instructor: {
    fontSize: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  chaptersSection: {
    marginBottom: 24,
  },
  chapterContent: {
    paddingTop: 8,
  },
  chapterDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  startQuizButton: {
    alignSelf: 'flex-start',
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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