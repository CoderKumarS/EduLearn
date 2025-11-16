import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { chapterService } from '../../services/courseService';
import progressService from '../../services/progressService';
import { Chapter, Topic, Quiz } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';

interface ChapterDetailScreenProps {
    chapterId: number;
    onNavigateBack: () => void;
    onNavigateToTopic: (topicId: number) => void;
    onNavigateToQuiz: (quizId: number) => void;
}

export const ChapterDetailScreen: React.FC<ChapterDetailScreenProps> = ({
    chapterId,
    onNavigateBack,
    onNavigateToTopic,
    onNavigateToQuiz,
}) => {
    const { theme } = useTheme();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadChapterData();
    }, [chapterId]);

    const loadChapterData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const chapterData = await chapterService.getChapter(chapterId);
            setChapter(chapterData);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        progressService.clearAllCache();
        loadChapterData(true);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!chapter) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <ThemedText style={styles.errorText}>Chapter not found</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    const progressPercentage = chapter.progress_percentage || 0;
    const completedTopics = chapter.completed_topics || 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle} numberOfLines={1}>
                    {chapter.title}
                </ThemedText>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Chapter Info */}
                <View style={styles.section}>
                    <ThemedText style={styles.description}>{chapter.description}</ThemedText>
                </View>

                {/* Progress Section */}
                <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.progressHeader}>
                        <ThemedText style={styles.progressTitle}>Your Progress</ThemedText>
                        <ThemedText style={styles.progressPercentage}>
                            {Math.round(progressPercentage)}%
                        </ThemedText>
                    </View>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
                        <View
                            style={[
                                styles.progressBar,
                                {
                                    backgroundColor: theme.colors.primary,
                                    width: `${progressPercentage}%`,
                                },
                            ]}
                        />
                    </View>
                    <ThemedText style={styles.progressText}>
                        {completedTopics} of {chapter.total_topics} topics completed
                    </ThemedText>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.statText}>
                                {chapter.total_duration || 0} min
                            </ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="book-outline" size={20} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.statText}>
                                {chapter.total_topics || 0} topics
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Topics List */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Topics</ThemedText>
                    {chapter.topics && chapter.topics.length > 0 ? (
                        chapter.topics.map((topic, index) => (
                            <TopicItem
                                key={topic.id}
                                topic={topic}
                                index={index}
                                onPress={() => onNavigateToTopic(topic.id)}
                                theme={theme}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.emptyText}>No topics available yet</ThemedText>
                        </View>
                    )}
                </View>

                {/* Quizzes Section */}
                {chapter.quizzes && chapter.quizzes.length > 0 && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Quizzes</ThemedText>
                        {chapter.quizzes.map((quiz) => (
                            <QuizItem
                                key={quiz.id}
                                quiz={quiz}
                                onPress={() => onNavigateToQuiz(quiz.id)}
                                theme={theme}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// Topic Item Component
interface TopicItemProps {
    topic: Topic;
    index: number;
    onPress: () => void;
    theme: any;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, index, onPress, theme }) => (
    <TouchableOpacity
        style={[styles.topicItem, { backgroundColor: theme.colors.card }]}
        onPress={onPress}
    >
        <View style={styles.topicLeft}>
            <View
                style={[
                    styles.topicNumber,
                    {
                        backgroundColor: topic.is_completed
                            ? theme.colors.success
                            : theme.colors.border,
                    },
                ]}
            >
                {topic.is_completed ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                    <ThemedText style={styles.topicNumberText}>{index + 1}</ThemedText>
                )}
            </View>
            <View style={styles.topicInfo}>
                <ThemedText style={styles.topicTitle}>{topic.title}</ThemedText>
                <View style={styles.topicMeta}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                    <ThemedText style={styles.topicDuration}>
                        {topic.duration_minutes} min
                    </ThemedText>
                    {topic.video_url && (
                        <>
                            <Ionicons
                                name="play-circle-outline"
                                size={14}
                                color={theme.colors.textSecondary}
                                style={styles.metaIcon}
                            />
                            <ThemedText style={styles.topicDuration}>Video</ThemedText>
                        </>
                    )}
                </View>
            </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
);

// Quiz Item Component
interface QuizItemProps {
    quiz: Quiz;
    onPress: () => void;
    theme: any;
}

const QuizItem: React.FC<QuizItemProps> = ({ quiz, onPress, theme }) => {
    const completionStatus = quiz.completion_status;
    const isCompleted = completionStatus?.is_completed || false;
    const isPassed = completionStatus?.passed || false;

    return (
        <TouchableOpacity
            style={[styles.quizItem, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
        >
            <View style={styles.quizLeft}>
                <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'help-circle-outline'}
                    size={32}
                    color={isCompleted ? (isPassed ? theme.colors.success : theme.colors.warning) : theme.colors.textSecondary}
                />
                <View style={styles.quizInfo}>
                    <ThemedText style={styles.quizTitle}>{quiz.title}</ThemedText>
                    <View style={styles.quizMeta}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                        <ThemedText style={styles.quizDuration}>
                            {quiz.time_limit_minutes} min
                        </ThemedText>
                        {quiz.is_required && (
                            <>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={14}
                                    color={theme.colors.error}
                                    style={styles.metaIcon}
                                />
                                <ThemedText style={[styles.quizDuration, { color: theme.colors.error }]}>
                                    Required
                                </ThemedText>
                            </>
                        )}
                    </View>
                    {isCompleted && completionStatus && (
                        <ThemedText style={styles.quizScore}>
                            Best Score: {Math.round(completionStatus.best_score)}%
                        </ThemedText>
                    )}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 24,
    },
    errorText: {
        fontSize: 18,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
    },
    refreshButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    progressCard: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressPercentage: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    topicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    topicLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    topicNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    topicNumberText: {
        fontSize: 14,
        fontWeight: '600',
    },
    topicInfo: {
        flex: 1,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    topicMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicDuration: {
        fontSize: 12,
        marginLeft: 4,
        opacity: 0.7,
    },
    metaIcon: {
        marginLeft: 12,
    },
    quizItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    quizLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    quizInfo: {
        flex: 1,
        marginLeft: 12,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    quizMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    quizDuration: {
        fontSize: 12,
        marginLeft: 4,
        opacity: 0.7,
    },
    quizScore: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
        opacity: 0.7,
    },
});
