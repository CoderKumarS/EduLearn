import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { courseService, chapterService } from '../../services/courseService';
import quizService from '../../services/quizService';
import { Course, Chapter, Quiz } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';
import { LoadingScreen } from '../../components/common/LoadingScreen';

interface ManageCourseScreenProps {
    courseId: number;
    onNavigateBack: () => void;
    onNavigateToManageTopics?: (chapterId: number) => void;
    onNavigateToManageQuiz?: (chapterId: number) => void;
}

export const ManageCourseScreen: React.FC<ManageCourseScreenProps> = ({
    courseId,
    onNavigateBack,
    onNavigateToManageTopics,
    onNavigateToManageQuiz,
}) => {
    const { theme } = useTheme();
    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'chapters' | 'quizzes'>('details');

    // Course edit states
    const [editingCourse, setEditingCourse] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');

    // Chapter management states
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [chapterTitle, setChapterTitle] = useState('');
    const [chapterDescription, setChapterDescription] = useState('');

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            const courseData = await courseService.getCourse(courseId);
            setCourse(courseData);
            // Use chapters from course data which includes quizzes and topics
            setChapters(courseData.chapters || []);
            setCourseTitle(courseData.title);
            setCourseDescription(courseData.description);
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async () => {
        if (!course) return;

        try {
            await courseService.updateCourse(course.id, {
                title: courseTitle,
                description: courseDescription,
            });
            Alert.alert('Success', 'Course updated successfully');
            setEditingCourse(false);
            loadCourseData();
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        }
    };

    const handleAddChapter = async () => {
        if (!chapterTitle.trim()) {
            Alert.alert('Error', 'Please enter a chapter title');
            return;
        }

        try {
            const newChapter = await chapterService.createChapter({
                course: courseId,
                title: chapterTitle,
                description: chapterDescription,
                order: chapters.length + 1,
            });

            Alert.alert('Success', 'Chapter added successfully');
            setShowAddChapter(false);
            resetChapterForm();
            loadCourseData();
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        }
    };

    const handleUpdateChapter = async () => {
        if (!editingChapter) return;

        try {
            await chapterService.updateChapter(editingChapter.id, {
                title: chapterTitle,
                description: chapterDescription,
            });

            Alert.alert('Success', 'Chapter updated successfully');
            setEditingChapter(null);
            resetChapterForm();
            loadCourseData();
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        }
    };

    const handleDeleteChapter = (chapter: Chapter) => {
        Alert.alert(
            'Delete Chapter',
            `Are you sure you want to delete "${chapter.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await chapterService.deleteChapter(chapter.id);
                            Alert.alert('Success', 'Chapter deleted successfully');
                            loadCourseData();
                        } catch (error) {
                            const apiError = handleApiError(error);
                            Alert.alert('Error', apiError.message);
                        }
                    },
                },
            ]
        );
    };

    const startEditChapter = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setChapterTitle(chapter.title);
        setChapterDescription(chapter.description || '');
    };

    const resetChapterForm = () => {
        setChapterTitle('');
        setChapterDescription('');
    };

    if (loading) {
        return <LoadingScreen message="Loading course..." />;
    }

    if (!course) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText>Course not found</ThemedText>
                    <Button title="Go Back" onPress={onNavigateBack} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Manage Course</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'details' && {
                            borderBottomColor: theme.colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setActiveTab('details')}
                >
                    <ThemedText
                        style={[
                            styles.tabText,
                            activeTab === 'details' && { color: theme.colors.primary },
                        ]}
                    >
                        Details
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'chapters' && {
                            borderBottomColor: theme.colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setActiveTab('chapters')}
                >
                    <ThemedText
                        style={[
                            styles.tabText,
                            activeTab === 'chapters' && { color: theme.colors.primary },
                        ]}
                    >
                        Chapters ({chapters.length})
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'quizzes' && {
                            borderBottomColor: theme.colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setActiveTab('quizzes')}
                >
                    <ThemedText
                        style={[
                            styles.tabText,
                            activeTab === 'quizzes' && { color: theme.colors.primary },
                        ]}
                    >
                        Quizzes
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <ThemedView style={styles.content}>
                    {/* Course Details Tab */}
                    {activeTab === 'details' && (
                        <View>
                            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                                <View style={styles.sectionHeader}>
                                    <ThemedText style={styles.sectionTitle}>Course Information</ThemedText>
                                    {!editingCourse && (
                                        <TouchableOpacity onPress={() => setEditingCourse(true)}>
                                            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {editingCourse ? (
                                    <View>
                                        <ThemedText style={styles.label}>Title</ThemedText>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                            value={courseTitle}
                                            onChangeText={setCourseTitle}
                                            placeholder="Course title"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />

                                        <ThemedText style={styles.label}>Description</ThemedText>
                                        <TextInput
                                            style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                            value={courseDescription}
                                            onChangeText={setCourseDescription}
                                            placeholder="Course description"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            multiline
                                            numberOfLines={4}
                                        />

                                        <View style={styles.buttonRow}>
                                            <Button
                                                title="Cancel"
                                                onPress={() => {
                                                    setEditingCourse(false);
                                                    setCourseTitle(course.title);
                                                    setCourseDescription(course.description);
                                                }}
                                                style={[styles.button, { backgroundColor: theme.colors.surface }]}
                                            />
                                            <Button
                                                title="Save"
                                                onPress={handleSaveCourse}
                                                style={styles.button}
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
                                        <ThemedText variant="secondary" style={styles.courseDescription}>
                                            {course.description}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Chapters Tab */}
                    {activeTab === 'chapters' && (
                        <View>
                            <View style={styles.addButtonContainer}>
                                <Button
                                    title="Add Chapter"
                                    onPress={() => setShowAddChapter(true)}
                                    style={styles.addButton}
                                />
                            </View>

                            {/* Add/Edit Chapter Form */}
                            {(showAddChapter || editingChapter) && (
                                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                                    <ThemedText style={styles.sectionTitle}>
                                        {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                                    </ThemedText>

                                    <ThemedText style={styles.label}>Title *</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                        value={chapterTitle}
                                        onChangeText={setChapterTitle}
                                        placeholder="Chapter title"
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />

                                    <ThemedText style={styles.label}>Description</ThemedText>
                                    <TextInput
                                        style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                        value={chapterDescription}
                                        onChangeText={setChapterDescription}
                                        placeholder="Chapter description"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    <ThemedText variant="secondary" style={styles.helpText}>
                                        Note: Topics and quizzes can be managed after creating the chapter using the "Manage Topics" and "Manage Quizzes" buttons.
                                    </ThemedText>

                                    <View style={styles.buttonRow}>
                                        <Button
                                            title="Cancel"
                                            onPress={() => {
                                                setShowAddChapter(false);
                                                setEditingChapter(null);
                                                resetChapterForm();
                                            }}
                                            style={[styles.button, { backgroundColor: theme.colors.surface }]}
                                        />
                                        <Button
                                            title={editingChapter ? 'Update' : 'Add'}
                                            onPress={editingChapter ? handleUpdateChapter : handleAddChapter}
                                            style={styles.button}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Chapters List */}
                            {chapters.map((chapter, index) => (
                                <View key={chapter.id} style={[styles.chapterCard, { backgroundColor: theme.colors.card }]}>
                                    <View style={styles.chapterHeader}>
                                        <View style={styles.chapterInfo}>
                                            <ThemedText style={styles.chapterNumber}>Chapter {index + 1}</ThemedText>
                                            <ThemedText style={styles.chapterTitle}>{chapter.title}</ThemedText>
                                        </View>
                                        <View style={styles.chapterActions}>
                                            <TouchableOpacity
                                                onPress={() => startEditChapter(chapter)}
                                                style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
                                            >
                                                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteChapter(chapter)}
                                                style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {chapter.description && (
                                        <ThemedText variant="secondary" style={styles.chapterDescription}>
                                            {chapter.description}
                                        </ThemedText>
                                    )}
                                    <View style={styles.chapterMeta}>
                                        {chapter.total_topics !== undefined && chapter.total_topics > 0 && (
                                            <View style={[styles.metaItem, { backgroundColor: theme.colors.primary + '15' }]}>
                                                <Ionicons name="book-outline" size={14} color={theme.colors.primary} />
                                                <ThemedText style={[styles.metaText, { color: theme.colors.primary }]}>
                                                    {chapter.total_topics} {chapter.total_topics === 1 ? 'Topic' : 'Topics'}
                                                </ThemedText>
                                            </View>
                                        )}
                                        {chapter.quizzes && chapter.quizzes.length > 0 && (
                                            <View style={[styles.metaItem, { backgroundColor: theme.colors.success + '15' }]}>
                                                <Ionicons name="help-circle-outline" size={14} color={theme.colors.success} />
                                                <ThemedText style={[styles.metaText, { color: theme.colors.success }]}>
                                                    {chapter.quizzes.length} {chapter.quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                                                </ThemedText>
                                            </View>
                                        )}
                                        {chapter.total_duration > 0 && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                                                <ThemedText style={styles.metaText}>
                                                    {chapter.total_duration} min
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.chapterManagementButtons}>
                                        {onNavigateToManageTopics && (
                                            <TouchableOpacity
                                                style={[styles.manageButton]}
                                                onPress={() => onNavigateToManageTopics(chapter.id)}
                                            >
                                                <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                                                <ThemedText style={styles.manageButtonText}>Manage Topics</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                        {onNavigateToManageQuiz && (
                                            <TouchableOpacity
                                                style={[styles.manageButton]}
                                                onPress={() => onNavigateToManageQuiz(chapter.id)}
                                            >
                                                <Ionicons name="help-circle-outline" size={16} color={theme.colors.primary} />
                                                <ThemedText style={styles.manageButtonText}>Manage Quizzes</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Quizzes Tab */}
                    {activeTab === 'quizzes' && (
                        <View>
                            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                                <ThemedText style={styles.sectionTitle}>Quiz Management</ThemedText>
                                <ThemedText variant="secondary" style={{ marginBottom: 16 }}>
                                    Quizzes are automatically created for each chapter. You can manage quiz questions and options through the chapter's quiz.
                                </ThemedText>

                                {chapters.map((chapter, index) => {
                                    const hasQuizzes = Array.isArray(chapter.quizzes) && chapter.quizzes.length > 0;
                                    const questionCount = hasQuizzes ? (chapter.quizzes?.[0]?.questions?.length || 0) : 0;

                                    return (
                                        <View key={chapter.id} style={[styles.quizItem, { backgroundColor: theme.colors.surface }]}>
                                            <View style={styles.quizInfo}>
                                                <ThemedText style={styles.quizTitle}>
                                                    Chapter {index + 1}: {chapter.title}
                                                </ThemedText>
                                                <ThemedText variant="secondary" style={styles.quizSubtitle}>
                                                    {hasQuizzes
                                                        ? `${chapter.quizzes?.length || 0} ${chapter.quizzes?.length === 1 ? 'Quiz' : 'Quizzes'} • ${questionCount} ${questionCount === 1 ? 'question' : 'questions'}`
                                                        : 'No quiz yet'}
                                                </ThemedText>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.manageQuizButton, { backgroundColor: hasQuizzes ? theme.colors.primary : theme.colors.textSecondary }]}
                                                onPress={() => {
                                                    if (hasQuizzes) {
                                                        Alert.alert('Quiz Management', 'Quiz editor coming soon');
                                                    } else {
                                                        Alert.alert('No Quiz', 'Create a quiz for this chapter first');
                                                    }
                                                }}
                                            >
                                                <Ionicons name={hasQuizzes ? "create-outline" : "add-circle-outline"} size={18} color="#FFFFFF" />
                                                <ThemedText style={styles.manageQuizText}>{hasQuizzes ? 'Manage' : 'Create'}</ThemedText>
                                            </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    textArea: {
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    button: {
        flex: 1,
    },
    courseTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    courseDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    addButtonContainer: {
        marginBottom: 16,
    },
    addButton: {
        alignSelf: 'flex-start',
    },
    helpText: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    chapterCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    chapterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    chapterInfo: {
        flex: 1,
    },
    chapterNumber: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
        opacity: 0.6,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    chapterTitle: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
    },
    chapterActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
    },
    chapterDescription: {
        fontSize: 14,
        marginTop: 8,
        lineHeight: 20,
        opacity: 0.8,
    },
    chapterMeta: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    quizItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    quizInfo: {
        flex: 1,
    },
    quizTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    quizSubtitle: {
        fontSize: 12,
    },
    manageQuizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    manageQuizText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    chapterManagementButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    manageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 8,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    manageButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000ff',
    },
});
