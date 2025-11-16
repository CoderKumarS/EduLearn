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
    const [chapterTopics, setChapterTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
    const [editingTopicValue, setEditingTopicValue] = useState('');
    const [chapterVideoUrl, setChapterVideoUrl] = useState('');
    const [chapterDuration, setChapterDuration] = useState('');

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            const [courseData, chaptersData] = await Promise.all([
                courseService.getCourse(courseId),
                chapterService.getChapters({ course: courseId }),
            ]);

            setCourse(courseData);
            setChapters(chaptersData);
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
                topics: chapterTopics,
                video_url: chapterVideoUrl,
                order: chapters.length + 1,
                duration_minutes: parseInt(chapterDuration) || 0,
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
                topics: chapterTopics,
                video_url: chapterVideoUrl,
                duration_minutes: parseInt(chapterDuration) || 0,
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
        setChapterTopics(chapter.topics || []);
        setChapterVideoUrl(chapter.video_url || '');
        setChapterDuration(chapter.duration_minutes?.toString() || '');
    };

    const resetChapterForm = () => {
        setChapterTitle('');
        setChapterDescription('');
        setChapterTopics([]);
        setNewTopic('');
        setChapterVideoUrl('');
        setChapterDuration('');
    };

    const addTopic = () => {
        if (newTopic.trim()) {
            setChapterTopics([...chapterTopics, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const removeTopic = (index: number) => {
        setChapterTopics(chapterTopics.filter((_, i) => i !== index));
    };

    const startEditTopic = (index: number) => {
        setEditingTopicIndex(index);
        setEditingTopicValue(chapterTopics[index]);
    };

    const saveEditTopic = () => {
        if (editingTopicIndex !== null && editingTopicValue.trim()) {
            const updatedTopics = [...chapterTopics];
            updatedTopics[editingTopicIndex] = editingTopicValue.trim();
            setChapterTopics(updatedTopics);
            setEditingTopicIndex(null);
            setEditingTopicValue('');
        }
    };

    const cancelEditTopic = () => {
        setEditingTopicIndex(null);
        setEditingTopicValue('');
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

                                    <ThemedText style={styles.label}>Video URL</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                        value={chapterVideoUrl}
                                        onChangeText={setChapterVideoUrl}
                                        placeholder="https://youtube.com/watch?v=..."
                                        placeholderTextColor={theme.colors.textSecondary}
                                        autoCapitalize="none"
                                    />

                                    <ThemedText style={styles.label}>Duration (minutes)</ThemedText>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                        value={chapterDuration}
                                        onChangeText={setChapterDuration}
                                        placeholder="30"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        keyboardType="numeric"
                                    />

                                    <ThemedText style={styles.label}>Topics</ThemedText>
                                    <View style={styles.topicInputContainer}>
                                        <TextInput
                                            style={[styles.topicInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                                            value={newTopic}
                                            onChangeText={setNewTopic}
                                            placeholder="Add a topic"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            onSubmitEditing={addTopic}
                                        />
                                        <TouchableOpacity
                                            style={[styles.addTopicButton, { backgroundColor: theme.colors.primary }]}
                                            onPress={addTopic}
                                        >
                                            <Ionicons name="add" size={24} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>

                                    {chapterTopics.length > 0 && (
                                        <View style={styles.topicsList}>
                                            {chapterTopics.map((topic, index) => (
                                                <View key={index} style={[styles.topicChip, { backgroundColor: theme.colors.surface }]}>
                                                    {editingTopicIndex === index ? (
                                                        <>
                                                            <TextInput
                                                                style={[styles.topicEditInput, { color: theme.colors.text }]}
                                                                value={editingTopicValue}
                                                                onChangeText={setEditingTopicValue}
                                                                onSubmitEditing={saveEditTopic}
                                                                autoFocus
                                                            />
                                                            <TouchableOpacity onPress={saveEditTopic} style={styles.topicActionButton}>
                                                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={cancelEditTopic} style={styles.topicActionButton}>
                                                                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                                                            </TouchableOpacity>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TouchableOpacity onPress={() => startEditTopic(index)} style={styles.topicTextContainer}>
                                                                <ThemedText style={styles.topicChipText}>{topic}</ThemedText>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => removeTopic(index)} style={styles.topicActionButton}>
                                                                <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                                                            </TouchableOpacity>
                                                        </>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}

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
                                                style={styles.actionButton}
                                            >
                                                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteChapter(chapter)}
                                                style={styles.actionButton}
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
                                        {chapter.duration_minutes > 0 && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                                                <ThemedText variant="secondary" style={styles.metaText}>
                                                    {chapter.duration_minutes} min
                                                </ThemedText>
                                            </View>
                                        )}
                                        {chapter.video_url && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="videocam-outline" size={14} color={theme.colors.textSecondary} />
                                                <ThemedText variant="secondary" style={styles.metaText}>
                                                    Video
                                                </ThemedText>
                                            </View>
                                        )}
                                        {chapter.topics && chapter.topics.length > 0 && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="list-outline" size={14} color={theme.colors.textSecondary} />
                                                <ThemedText variant="secondary" style={styles.metaText}>
                                                    {chapter.topics.length} topics
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.chapterManagementButtons}>
                                        {onNavigateToManageTopics && (
                                            <TouchableOpacity
                                                style={[styles.manageButton, { borderColor: theme.colors.border }]}
                                                onPress={() => onNavigateToManageTopics(chapter.id)}
                                            >
                                                <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                                                <ThemedText style={styles.manageButtonText}>Manage Topics</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                        {onNavigateToManageQuiz && (
                                            <TouchableOpacity
                                                style={[styles.manageButton, { borderColor: theme.colors.border }]}
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

                                {chapters.map((chapter, index) => (
                                    <View key={chapter.id} style={[styles.quizItem, { backgroundColor: theme.colors.surface }]}>
                                        <View style={styles.quizInfo}>
                                            <ThemedText style={styles.quizTitle}>
                                                Chapter {index + 1}: {chapter.title}
                                            </ThemedText>
                                            <ThemedText variant="secondary" style={styles.quizSubtitle}>
                                                {chapter.quizzes && chapter.quizzes.length > 0
                                                    ? `${chapter.quizzes[0].questions?.length || 0} questions`
                                                    : 'No quiz yet'}
                                            </ThemedText>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.manageQuizButton, { backgroundColor: theme.colors.primary }]}
                                            onPress={() => Alert.alert('Quiz Management', 'Quiz editor coming soon')}
                                        >
                                            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                                            <ThemedText style={styles.manageQuizText}>Manage</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                ))}
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
    topicInputContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    topicInput: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    addTopicButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topicsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    topicChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    topicChipText: {
        fontSize: 12,
    },
    topicTextContainer: {
        flex: 1,
    },
    topicEditInput: {
        flex: 1,
        fontSize: 12,
        padding: 0,
        minWidth: 80,
    },
    topicActionButton: {
        padding: 2,
    },
    chapterCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    chapterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    chapterInfo: {
        flex: 1,
    },
    chapterNumber: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    chapterActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    chapterDescription: {
        fontSize: 14,
        marginTop: 8,
    },
    chapterMeta: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
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
        gap: 8,
        marginTop: 12,
    },
    manageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    manageButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
