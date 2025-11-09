import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedText } from '../components';
import { CourseCard } from '../components/CourseCard';
import { FilterChip } from '../components/FilterChip';
import { courseService } from '../services/courseService';
import { Course } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface CoursesScreenProps {
  onNavigateBack: () => void;
  onNavigateToCourse: (courseId: string) => void;
}

const CATEGORIES = ['All', 'AI & ML', 'Programming', 'Data Science', 'Design', 'Cybersecurity', 'Marketing'];

export const CoursesScreen: React.FC<CoursesScreenProps> = ({
  onNavigateToCourse,
}) => {
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadData = async () => {
    try {
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter courses based on search and category
  useEffect(() => {
    let filtered = courses;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        course.description.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply search filter with debounced query
    if (debouncedSearchQuery.trim() !== '') {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.instructor.username.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
    setPage(1); // Reset pagination when filters change
  }, [debouncedSearchQuery, selectedCategory, courses]);

  // Paginate displayed courses
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedCourses(filteredCourses.slice(startIndex, endIndex));
  }, [filteredCourses, page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadData();
  };

  const handleLoadMore = () => {
    if (loadingMore || displayedCourses.length >= filteredCourses.length) {
      return;
    }

    setLoadingMore(true);
    setTimeout(() => {
      setPage(prevPage => prevPage + 1);
      setLoadingMore(false);
    }, 500);
  };

  const renderCourseCard = ({ item, index }: { item: Course; index: number }) => {
    // Determine category badge from course title/description
    let category = 'General';
    const lowerTitle = item.title.toLowerCase();
    const lowerDesc = item.description.toLowerCase();

    if (lowerTitle.includes('ai') || lowerTitle.includes('ml') || lowerDesc.includes('machine learning')) {
      category = 'AI & ML';
    } else if (lowerTitle.includes('program') || lowerTitle.includes('code')) {
      category = 'Programming';
    } else if (lowerTitle.includes('data') || lowerTitle.includes('science')) {
      category = 'Data Science';
    } else if (lowerTitle.includes('design') || lowerTitle.includes('ux')) {
      category = 'Design';
    } else if (lowerTitle.includes('cyber') || lowerTitle.includes('security')) {
      category = 'Cybersecurity';
    } else if (lowerTitle.includes('market')) {
      category = 'Marketing';
    }

    return (
      <View style={[styles.courseCardWrapper, index % 2 === 0 ? styles.courseCardLeft : styles.courseCardRight]}>
        <CourseCard
          id={item.id}
          title={item.title}
          category={category}
          instructor={item.instructor.username}
          rating={4.5}
          imageUrl="https://via.placeholder.com/400x225"
          onPress={() => onNavigateToCourse(item.id)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing.md }]}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.md,
            }
          ]}
        >
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              theme.typography.body,
              { color: theme.colors.text },
            ]}
            placeholder="Search for courses or topics..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filters */}
      <View style={[styles.filtersContainer, { paddingHorizontal: theme.spacing.md }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={category}
              isSelected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Courses Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText>Loading courses...</ThemedText>
        </View>
      ) : filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={theme.colors.textTertiary} />
          <ThemedText style={[styles.emptyText, theme.typography.body, { color: theme.colors.textSecondary }]}>
            {debouncedSearchQuery || selectedCategory !== 'All'
              ? 'No courses found matching your criteria.'
              : 'No courses available.'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={displayedCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[styles.coursesList, { paddingHorizontal: theme.spacing.md }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ThemedText style={{ color: theme.colors.textSecondary }}>Loading more...</ThemedText>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
  },
  coursesList: {
    paddingBottom: 16,
  },
  courseCardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  courseCardLeft: {
    paddingRight: 8,
  },
  courseCardRight: {
    paddingLeft: 8,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
