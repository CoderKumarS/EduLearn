import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  TextInput,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { courseService } from '../services/courseService';
import { Course, Enrollment } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface CoursesScreenProps {
  onNavigateBack: () => void;
  onNavigateToCourse: (courseId: string) => void;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({
  onNavigateBack,
  onNavigateToCourse,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        courseService.getCourses(),
        courseService.getEnrollments(),
      ]);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
      setFilteredCourses(coursesData);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn('Failed to load courses:', apiError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course.id === courseId);
  };

  const handleEnroll = async (courseId: string) => {
    if (enrollingCourseId) return;

    setEnrollingCourseId(courseId);
    try {
      const enrollment = await courseService.enrollInCourse(courseId);
      setEnrollments(prev => [...prev, enrollment]);
      Alert.alert('Success', 'Successfully enrolled in the course!');
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const renderCourseCard = (course: Course) => {
    const enrolled = isEnrolled(course.id);
    const isEnrolling = enrollingCourseId === course.id;

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
          <ThemedText variant="secondary" style={styles.courseInstructor}>
            by {course.instructor.username}
          </ThemedText>
        </View>

        <ThemedText variant="secondary" style={styles.courseDescription} numberOfLines={3}>
          {course.description}
        </ThemedText>

        <View style={styles.courseFooter}>
          <ThemedText variant="secondary" style={styles.courseDate}>
            Created: {new Date(course.created_at).toLocaleDateString()}
          </ThemedText>
          
          {authState.user?.role === 'student' && (
            <View style={styles.enrollButton}>
              {enrolled ? (
                <Button
                  title="Enrolled"
                  variant="outline"
                  size="small"
                  disabled
                />
              ) : (
                <Button
                  title="Enroll"
                  size="small"
                  loading={isEnrolling}
                  onPress={() => handleEnroll(course.id)}
                />
              )}
            </View>
          )}
        </View>
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
        <ThemedText style={styles.headerTitle}>All Courses</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }
          ]}
          placeholder="Search courses..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Courses List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading courses...</ThemedText>
            </View>
          ) : filteredCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {searchQuery ? 'No courses found matching your search.' : 'No courses available.'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.coursesList}>
              {filteredCourses.map(renderCourseCard)}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  coursesList: {
    paddingBottom: 20,
  },
  courseCard: {
    padding: 16,
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
  courseHeader: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseDate: {
    fontSize: 12,
  },
  enrollButton: {
    minWidth: 80,
  },
});