import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Share,
    Dimensions,
    Modal,
    Linking,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { ChapterItem } from '../../components/course/ChapterItem';
import { courseService, enrollmentService } from '../../services/courseService';
import quizService from '../../services/quizService';
import { Course, Quiz, Enrollment, Chapter } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { getFullImageUrl, getCourseImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

interface CourseDetailScreenProps {
    courseId: number;
    onNavigateBack: () => void;
    onNavigateToQuiz: (quizId: number) => void;
    onNavigateToLogin?: () => void;
    onNavigateToManageCourse?: (courseId: number) => void;
    onNavigateToChapter?: (chapterId: number) => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
    courseId,
    onNavigateBack,
    onNavigateToQuiz,
    onNavigateToLogin,
    onNavigateToManageCourse,
    onNavigateToChapter,
}) => {
    const { user, isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const [course, setCourse] = useState<Course | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [enrollmentCount, setEnrollmentCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
    const [selectedTopic, setSelectedTopic] = useState<{ title: string; details: any } | null>(null);
    const [showTopicModal, setShowTopicModal] = useState(false);

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            const [courseData, quizzesData, enrollCount] = await Promise.all([
                courseService.getCourse(courseId),
                quizService.quiz.getQuizzes({ course: courseId }),
                courseService.getCourseEnrollmentCount(courseId),
            ]);

            setCourse(courseData);
            // Handle both array and paginated response
            const quizzesList = Array.isArray(quizzesData)
                ? quizzesData
                : (quizzesData && typeof quizzesData === 'object' && 'results' in quizzesData ? (quizzesData as any).results : []);
            setQuizzes(quizzesList);
            setEnrollmentCount(enrollCount);

            // Fetch user's enrollments only if authenticated
            if (isAuthenticated && user) {
                try {
                    // Use getMyCourses which returns enrollments for the current user
                    const userEnrollments = await enrollmentService.getMyCourses();
                    setEnrollments(userEnrollments);
                } catch (enrollError) {
                    console.error('Error loading enrollments:', enrollError);
                    // If enrollment fetch fails, set empty array
                    setEnrollments([]);
                }
            }
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const isEnrolled = () => {
        if (!user || enrollments.length === 0) {
            return false;
        }

        // Check if user is enrolled in this course
        const enrolled = enrollments.some(enrollment => {
            // Handle both cases: course as object or course as ID
            const enrollmentCourseId = typeof enrollment.course === 'object'
                ? enrollment.course.id
                : enrollment.course;

            return enrollmentCourseId === courseId && enrollment.is_active;
        });

        return enrolled;
    };

    const handleEnroll = async () => {
        if (!course) return;

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            Alert.alert(
                'Login Required',
                'Please sign in to enroll in this course',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Sign In',
                        onPress: () => onNavigateToLogin?.()
                    }
                ]
            );
            return;
        }

        setEnrolling(true);
        try {
            const enrollmentResult = await enrollmentService.enrollInCourse(courseId);

            // Fetch updated enrollments for the user using getMyCourses
            const userEnrollments = await enrollmentService.getMyCourses();
            setEnrollments(userEnrollments);

            Alert.alert('Success', 'Successfully enrolled in the course!');
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Enrollment error:', error);
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

    const toggleChapter = (chapterId: number) => {
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

    const getTopicDetails = (topicTitle: string) => {
        // Generate topic details with explanation, example, and YouTube link
        const topicDetailsMap: Record<string, any> = {
            'Python Installation and Setup': {
                explanation: 'Learn how to install Python on your system and set up your development environment. This includes downloading Python from the official website, configuring PATH variables, and verifying the installation.',
                example: '# Check Python version\npython --version\n\n# Run Python interactive shell\npython\n\n# Exit Python shell\nexit()',
                youtubeLink: 'https://www.youtube.com/results?search_query=python+installation+tutorial'
            },
            'Variables and Data Types': {
                explanation: 'Variables are containers for storing data values. Python has various data types including integers, floats, strings, booleans, lists, tuples, and dictionaries.',
                example: '# Integer\nage = 25\n\n# Float\nprice = 19.99\n\n# String\nname = "John"\n\n# Boolean\nis_student = True\n\n# List\nfruits = ["apple", "banana", "orange"]',
                youtubeLink: 'https://www.youtube.com/results?search_query=python+variables+data+types'
            },
            'JSX Syntax': {
                explanation: 'JSX is a syntax extension for JavaScript that lets you write HTML-like code in your JavaScript files. It makes it easier to create React elements and components.',
                example: 'const element = <h1>Hello, World!</h1>;\n\nconst user = { name: "John" };\nconst greeting = <h1>Hello, {user.name}!</h1>;',
                youtubeLink: 'https://www.youtube.com/results?search_query=react+jsx+tutorial'
            },
            'useState Hook': {
                explanation: 'useState is a React Hook that lets you add state to functional components. It returns an array with the current state value and a function to update it.',
                example: 'import { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}',
                youtubeLink: 'https://www.youtube.com/results?search_query=react+useState+hook+tutorial'
            }
        };

        return topicDetailsMap[topicTitle] || {
            explanation: `Learn about ${topicTitle} in detail. This topic covers important concepts and practical applications that will help you master this subject.`,
            example: `// Example code for ${topicTitle}\n// Practice this concept with hands-on exercises`,
            youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicTitle + ' tutorial')}`
        };
    };

    const handleTopicClick = (topicTitle: string) => {
        const details = getTopicDetails(topicTitle);
        setSelectedTopic({ title: topicTitle, details });
        setShowTopicModal(true);
    };

    if (loading) {
        return <LoadingScreen message="Loading course details..." />;
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
    const isInstructor = user?.role === 'instructor';
    const isOwnCourse = course.instructor.id === user?.id;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Custom Header with Title */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Course Details</ThemedText>
                <View style={styles.headerActions}>
                    {isOwnCourse && (
                        <TouchableOpacity
                            onPress={() => onNavigateToManageCourse?.(courseId)}
                            style={styles.iconButton}
                            accessibilityLabel="Manage course"
                            accessibilityRole="button"
                        >
                            <Ionicons name="create-outline" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}
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
                {/* Course Thumbnail */}
                {course.thumbnail_image && (
                    <View style={[styles.videoContainer, { backgroundColor: theme.colors.surface }]}>
                        <Image
                            source={{ uri: getFullImageUrl(course.thumbnail_image) || getCourseImageUrl(course.thumbnail_image, course.title, course.id) }}
                            style={styles.courseThumbnailImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

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
                        {isOwnCourse && (
                            <View style={[styles.enrollmentBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
                                <ThemedText style={[styles.enrollmentBadgeText, { color: theme.colors.primary }]}>
                                    {enrollmentCount} {enrollmentCount === 1 ? 'student' : 'students'} enrolled
                                </ThemedText>
                            </View>
                        )}
                        <ThemedText style={styles.description}>{course.description}</ThemedText>
                    </View>

                    {/* Course Chapters */}
                    <View style={styles.chaptersSection}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>Course Chapters</ThemedText>
                            {isOwnCourse && (
                                <TouchableOpacity
                                    onPress={() => onNavigateToManageCourse?.(courseId)}
                                    style={styles.addButton}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                                    <ThemedText style={[styles.addButtonText, { color: theme.colors.primary }]}>
                                        Manage Course
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                        {course.chapters && course.chapters.length > 0 ? (
                            course.chapters.map((chapter) => (
                                <ChapterItem
                                    key={chapter.id}
                                    chapterNumber={chapter.order}
                                    title={chapter.title}
                                    videoUrl={enrolled || isOwnCourse ? chapter.video_url : undefined}
                                    duration={chapter.total_duration}
                                    hasQuiz={Boolean(chapter.quizzes && chapter.quizzes.length > 0)}
                                    topicCount={chapter.topics?.length || 0}
                                    quizCount={chapter.quizzes?.length || 0}
                                    isExpanded={Boolean(expandedChapters.has(chapter.id))}
                                    onToggle={() => {
                                        if (enrolled || isOwnCourse) {
                                            if (onNavigateToChapter) {
                                                onNavigateToChapter(chapter.id);
                                            } else {
                                                toggleChapter(chapter.id);
                                            }
                                        } else {
                                            Alert.alert('Enroll Required', 'Please enroll in this course to access chapter content.');
                                        }
                                    }}
                                    onEdit={isOwnCourse ? () => Alert.alert('Edit Chapter', `Edit ${chapter.title}`) : undefined}
                                    onDelete={isOwnCourse ? () => Alert.alert('Delete Chapter', `Delete ${chapter.title}?`) : undefined}
                                >
                                    {(enrolled || isOwnCourse) ? (
                                        <>
                                            {(chapter.description || chapter.content) && (
                                                <View style={styles.chapterContent}>
                                                    <ThemedText variant="secondary" style={styles.chapterDescription}>
                                                        {chapter.description || chapter.content}
                                                    </ThemedText>
                                                </View>
                                            )}
                                            {chapter.topics && chapter.topics.length > 0 && (
                                                <View style={styles.chapterContent}>
                                                    <ThemedText style={styles.topicsTitle}>Topics Covered:</ThemedText>
                                                    {chapter.topics.map((topic, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={styles.topicItem}
                                                            onPress={() => handleTopicClick(topic.title)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                                                            <ThemedText variant="secondary" style={styles.topicText}>
                                                                {topic.title}
                                                            </ThemedText>
                                                            <Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                            {chapter.quizzes && chapter.quizzes.length > 0 && (
                                                <View style={styles.chapterContent}>
                                                    <ThemedText variant="secondary" style={styles.chapterDescription}>
                                                        Test your knowledge with this quiz
                                                    </ThemedText>
                                                    <ThemedText variant="secondary" style={styles.quizAttemptsText}>
                                                        Attempts left: {chapter.quizzes[0].max_attempts - (chapter.quizzes[0].attempt_count || 0)} / {chapter.quizzes[0].max_attempts}
                                                    </ThemedText>
                                                    <Button
                                                        title="Start Quiz"
                                                        onPress={() => onNavigateToQuiz(chapter.quizzes![0].id)}
                                                        style={styles.startQuizButton}
                                                    />
                                                </View>
                                            )}
                                        </>
                                    ) : (
                                        <View style={styles.chapterContent}>
                                            <View style={[styles.lockedContent, { backgroundColor: theme.colors.surface }]}>
                                                <Ionicons name="lock-closed-outline" size={24} color={theme.colors.textSecondary} />
                                                <ThemedText variant="secondary" style={styles.lockedText}>
                                                    Enroll in this course to access chapter content
                                                </ThemedText>
                                            </View>
                                        </View>
                                    )}
                                </ChapterItem>
                            ))
                        ) : (
                            <View style={[styles.emptyChapters, { backgroundColor: theme.colors.card }]}>
                                <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                                <ThemedText variant="secondary" style={styles.emptyText}>
                                    No chapters added yet
                                </ThemedText>
                                {isOwnCourse && (
                                    <ThemedText variant="secondary" style={styles.emptySubtext}>
                                        Add your first chapter to get started
                                    </ThemedText>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Enrollment Status - Only show if not enrolled and not own course */}
                    {!isOwnCourse && !enrolled && (user?.role === 'student' || !isAuthenticated) && (
                        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                            <ThemedText style={styles.sectionTitle}>Enrollment</ThemedText>
                            <View style={styles.enrollmentActions}>
                                <ThemedText style={styles.enrollmentText}>
                                    {isAuthenticated
                                        ? 'Enroll in this course to access quizzes and track your progress.'
                                        : 'Sign in and enroll to access course content and track your progress.'
                                    }
                                </ThemedText>
                                <Button
                                    title="Enroll Now"
                                    onPress={handleEnroll}
                                    loading={Boolean(enrolling)}
                                    style={styles.enrollButton}
                                />
                            </View>
                        </View>
                    )}

                    {/* Quizzes */}
                    {(enrolled || isInstructor) && (
                        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                            <ThemedText style={styles.sectionTitle}>
                                Quizzes ({Array.isArray(quizzes) ? quizzes.length : 0})
                            </ThemedText>

                            {!Array.isArray(quizzes) || quizzes.length === 0 ? (
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
                                                    {quiz.time_limit_minutes} min
                                                </ThemedText>
                                            </View>
                                            <ThemedText variant="secondary" style={styles.quizDate}>
                                                {quiz.questions?.length || 0} questions
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

            {/* Topic Details Modal */}
            <Modal
                visible={showTopicModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTopicModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>{selectedTopic?.title}</ThemedText>
                            <TouchableOpacity onPress={() => setShowTopicModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                                <ThemedText style={styles.modalSectionTitle}>Explanation</ThemedText>
                                <ThemedText variant="secondary" style={styles.modalText}>
                                    {selectedTopic?.details.explanation}
                                </ThemedText>
                            </View>

                            <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                                <ThemedText style={styles.modalSectionTitle}>Example</ThemedText>
                                <View style={[styles.codeBlock, { backgroundColor: theme.colors.surface }]}>
                                    <ThemedText style={styles.codeText}>
                                        {selectedTopic?.details.example}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                                <ThemedText style={styles.modalSectionTitle}>Learn More</ThemedText>
                                <TouchableOpacity
                                    style={[styles.youtubeButton, { backgroundColor: '#FF0000' }]}
                                    onPress={() => {
                                        if (selectedTopic?.details.youtubeLink) {
                                            Linking.openURL(selectedTopic.details.youtubeLink);
                                        }
                                    }}
                                >
                                    <Ionicons name="logo-youtube" size={24} color="#FFFFFF" />
                                    <ThemedText style={styles.youtubeButtonText}>Watch Tutorial on YouTube</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                title="Close"
                                onPress={() => setShowTopicModal(false)}
                                style={styles.closeButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    videoContainer: {
        width: width,
        aspectRatio: 16 / 9,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    courseThumbnailImage: {
        width: '100%',
        height: '100%',
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
    enrollmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 6,
        marginTop: 8,
        marginBottom: 12,
    },
    enrollmentBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    chaptersSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyChapters: {
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    chapterContent: {
        paddingTop: 8,
    },
    chapterDescription: {
        fontSize: 14,
        marginBottom: 12,
    },
    topicsTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    topicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        padding: 8,
        borderRadius: 6,
    },
    topicText: {
        fontSize: 13,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
    },
    modalBody: {
        flex: 1,
    },
    modalSection: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 22,
    },
    codeBlock: {
        padding: 12,
        borderRadius: 8,
        fontFamily: 'monospace',
    },
    codeText: {
        fontSize: 12,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
    youtubeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    youtubeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    modalFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    closeButton: {
        width: '100%',
    },
    quizAttemptsText: {
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
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
    lockedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        gap: 12,
    },
    lockedText: {
        flex: 1,
        fontSize: 14,
    },
});
