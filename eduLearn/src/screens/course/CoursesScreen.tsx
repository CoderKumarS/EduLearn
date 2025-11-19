import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { courseService } from '../../services/courseService';
import { Course } from '../../types/course';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { getCourseImageUrl } from '../../utils/imageUtils';

const CoursesScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseService.getCourses();
            setCourses(data);
        } catch (err) {
            console.error('Error loading courses:', err);
            setError('Failed to load courses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadCourses();
        setRefreshing(false);
    };

    // Get unique categories from courses
    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter((cat): cat is string => Boolean(cat))))];

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Programming': '#00FF94',
            'Data Science': '#00D9FF',
            'Web Development': '#4ECDC4',
            'Mobile Development': '#FF6B6B',
            'Machine Learning': '#A8E6CF',
            'DevOps': '#FFD93D',
            'Cybersecurity': '#FF6B9D',
            'Cloud Computing': '#95E1D3',
        };
        return colors[category] || '#00D9FF';
    };

    const filteredCourses = courses.filter(course => {
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderCourseCard = (course: Course) => {
        const categoryColor = getCategoryColor(course.category || '');
        const imageUrl = getCourseImageUrl(course.thumbnail_image, course.title, course.id);

        return (
            <TouchableOpacity
                key={course.id}
                style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.courseImage}
                    resizeMode="cover"
                    onError={(error) => console.log('Image load error for', course.title, error.nativeEvent)}
                />
                <View style={styles.courseContent}>
                    <View style={styles.courseTitleRow}>
                        <ThemedText style={styles.courseTitle} numberOfLines={1}>
                            {course.title}
                        </ThemedText>
                        {course.category && (
                            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                                <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
                                    {course.category}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                    <ThemedText variant="secondary" style={styles.courseDescription} numberOfLines={2}>
                        {course.description}
                    </ThemedText>
                    <View style={styles.courseFooter}>
                        <View style={styles.instructorRow}>
                            <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
                            <ThemedText variant="secondary" style={styles.instructorText} numberOfLines={1}>
                                {course.instructor.username}
                            </ThemedText>
                        </View>
                        <View style={styles.chaptersRow}>
                            <Ionicons name="book-outline" size={12} color={theme.colors.textSecondary} />
                            <ThemedText variant="secondary" style={styles.chaptersText}>
                                {course.chapters?.length || 0} chapters
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Bar and Filters */}
            <View style={[styles.stickySection, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search for courses or topics..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                {
                                    backgroundColor: selectedCategory === category
                                        ? theme.colors.primary
                                        : theme.colors.surface,
                                },
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <ThemedText
                                style={[
                                    styles.categoryChipText,
                                    {
                                        color: selectedCategory === category
                                            ? '#FFFFFF'
                                            : theme.colors.text,
                                    },
                                ]}
                            >
                                {category}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Scrollable Course List */}
            {loading ? (
                <LoadingScreen message="Loading courses..." />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                    <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                        {error}
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={loadCourses}
                    >
                        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    <View style={styles.courseList}>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => renderCourseCard(course))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
                                <ThemedText variant="secondary" style={styles.emptyText}>
                                    No courses found
                                </ThemedText>
                                <ThemedText variant="secondary" style={styles.emptySubtext}>
                                    Try adjusting your search or filters
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stickySection: {
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    scrollView: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    categoriesContainer: {
        marginBottom: 0,
    },
    categoriesContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    courseList: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    courseCard: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    courseImage: {
        width: 100,
        height: 100,
        backgroundColor: '#E5E7EB',
    },
    courseContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    courseTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
        flex: 1,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '700',
    },
    courseDescription: {
        fontSize: 11,
        lineHeight: 14,
        marginBottom: 4,
    },
    courseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    instructorText: {
        fontSize: 11,
    },
    chaptersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    chaptersText: {
        fontSize: 11,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default CoursesScreen;
