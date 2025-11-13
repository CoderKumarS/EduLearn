import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    rating: number;
    category: string;
    image: string;
    categoryColor: string;
}

const CoursesScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const categories = ['All', 'AI & ML', 'Programming', 'Data Science', 'Design', 'Marketing', 'Cybersec'];

    // Mock course data
    const courses: Course[] = [
        {
            id: '1',
            title: 'Advanced AI Ethics',
            description: 'Explore the complex ethical...',
            instructor: 'Dr. Emily Chen',
            rating: 4.8,
            category: 'AI & ML',
            image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=AI',
            categoryColor: '#00D9FF',
        },
        {
            id: '2',
            title: 'Fullstack Web Dev',
            description: 'Master modern fullstack...',
            instructor: 'John Doe',
            rating: 4.7,
            category: 'Programming',
            image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Web',
            categoryColor: '#00FF94',
        },
        {
            id: '3',
            title: 'Data Science with Python',
            description: 'Learn data analysis, visualization, and...',
            instructor: 'Sarah Lee',
            rating: 4.9,
            category: 'Data Science',
            image: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=Data',
            categoryColor: '#00D9FF',
        },
        {
            id: '4',
            title: 'Digital Marketing Pro',
            description: 'Comprehensive guide to digital...',
            instructor: 'Mark Johnson',
            rating: 4.6,
            category: 'Marketing',
            image: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=Marketing',
            categoryColor: '#00D9FF',
        },
        {
            id: '5',
            title: 'UI/UX Design Principles',
            description: 'Fundamental principles of user...',
            instructor: 'Jessica Wong',
            rating: 4.5,
            category: 'Design',
            image: 'https://via.placeholder.com/150/FFEAA7/333333?text=Design',
            categoryColor: '#00D9FF',
        },
        {
            id: '6',
            title: 'Cloud Security',
            description: 'Learn the essentials of securing cloud...',
            instructor: 'David Kim',
            rating: 4.8,
            category: 'Cybersec',
            image: 'https://via.placeholder.com/150/DFE6E9/333333?text=Security',
            categoryColor: '#00D9FF',
        },
    ];

    const filteredCourses = courses.filter(course => {
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderCourseCard = (course: Course) => (
        <TouchableOpacity
            key={course.id}
            style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
        >
            <Image
                source={{ uri: course.image }}
                style={styles.courseImage}
                resizeMode="cover"
            />
            <View style={styles.courseContent}>
                <View style={styles.courseTitleRow}>
                    <ThemedText style={styles.courseTitle} numberOfLines={1}>
                        {course.title}
                    </ThemedText>
                    <View style={[styles.categoryBadge, { backgroundColor: course.categoryColor + '20' }]}>
                        <ThemedText style={[styles.categoryText, { color: course.categoryColor }]}>
                            {course.category}
                        </ThemedText>
                    </View>
                </View>
                <ThemedText variant="secondary" style={styles.courseDescription} numberOfLines={1}>
                    {course.description}
                </ThemedText>
                <View style={styles.courseFooter}>
                    <View style={styles.instructorRow}>
                        <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
                        <ThemedText variant="secondary" style={styles.instructorText}>
                            {course.instructor}
                        </ThemedText>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#FFB800" />
                        <ThemedText style={styles.ratingText}>{course.rating}</ThemedText>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Explore Courses</ThemedText>
                <TouchableOpacity style={styles.searchIconButton}>
                    <Ionicons name="search-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Sticky Search Bar */}
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
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.courseList}>
                    {filteredCourses.map((course) => renderCourseCard(course))}
                </View>
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    searchIconButton: {
        padding: 4,
    },
    stickySection: {
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
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default CoursesScreen;
