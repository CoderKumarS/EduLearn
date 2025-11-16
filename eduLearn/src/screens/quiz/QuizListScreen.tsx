import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { quizService } from '../../services/quizService';
import { Quiz } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';

interface QuizListScreenProps {
    chapterId: number;
    onNavigateBack: () => void;
    onNavigateToQuiz: (quizId: number) => void;
}

export const QuizListScreen: React.FC<QuizListScreenProps> = ({
    chapterId,
    onNavigateBack,
    onNavigateToQuiz,
}) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, [chapterId]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizService.getQuizzes({ chapter: chapterId });
            setQuizzes(data.sort((a, b) => a.order - b.order));
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const getQuizStatus = (quiz: Quiz) => {
        if (!quiz.completion_status) {
            return {
                status: 'available',
                label: 'Not Started',
                icon: 'play-circle-outline' as const,
                color: theme.colors.primary,
            };
        }

        if (quiz.completion_status.is_completed) {
            return {
                status: 'completed',
                label: `Score: ${quiz.completion_status.best_score}%`,
                icon: 'checkmark-circle' as const,
                color: quiz.completion_status.passed ? theme.colors.success : theme.colors.warning,
            };
        }

        return {
            status: 'in_progress',
            label: 'In Progress',
            icon: 'time-outline' as const,
            color: theme.colors.warning,
        };
    };

    const handleStartQuiz = (quiz: Quiz) => {
        if (!quiz.is_active) {
            Alert.alert('Quiz Unavailable', 'This quiz is currently not available.');
            return;
        }

        const status = getQuizStatus(quiz);
        if (status.status === 'completed' && quiz.completion_status) {
            const attemptsLeft = quiz.max_attempts - quiz.completion_status.attempts_count;
            if (attemptsLeft <= 0) {
                Alert.alert(
                    'No Attempts Left',
                    `You have used all ${quiz.max_attempts} attempts for this quiz.`
                );
                return;
            }

            Alert.alert(
                'Retake Quiz',
                `You have ${attemptsLeft} attempt(s) remaining. Your best score is ${quiz.completion_status.best_score}%. Do you want to retake this quiz?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Start', onPress: () => onNavigateToQuiz(quiz.id) },
                ]
            );
            return;
        }

        onNavigateToQuiz(quiz.id);
    };

    const renderQuizCard = (quiz: Quiz, index: number) => {
        const status = getQuizStatus(quiz);
        const isLocked = !quiz.is_active;

        return (
            <View
                key={quiz.id}
                style={[
                    styles.quizCard,
                    { backgroundColor: theme.colors.card },
                    isLocked && styles.lockedCard,
                ]}
            >
                <View style={styles.quizHeader}>
                    <View style={styles.quizNumber}>
                        <ThemedText style={styles.quizNumberText}>#{index + 1}</ThemedText>
                    </View>
                    <View style={styles.quizInfo}>
                        <ThemedText style={styles.quizTitle}>{quiz.title}</ThemedText>
                        {quiz.description && (
                            <ThemedText style={styles.quizDescription} numberOfLines={2}>
                                {quiz.description}
                            </ThemedText>
                        )}
                    </View>
                    {isLocked && (
                        <Ionicons name="lock-closed" size={24} color={theme.colors.textSecondary} />
                    )}
                </View>

                <View style={styles.quizMeta}>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="help-circle-outline" size={16} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>
                                {quiz.question_count || 0} questions
                            </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>
                                {quiz.time_limit_minutes} min
                            </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="trophy-outline" size={16} color={theme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>
                                Pass: {quiz.passing_score}%
                            </ThemedText>
                        </View>
                    </View>

                    {quiz.is_required && (
                        <View style={[styles.requiredBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                            <Ionicons name="star" size={14} color={theme.colors.warning} />
                            <ThemedText style={[styles.requiredText, { color: theme.colors.warning }]}>
                                Required
                            </ThemedText>
                        </View>
                    )}
                </View>

                <View style={styles.quizStatus}>
                    <View style={styles.statusBadge}>
                        <Ionicons name={status.icon} size={20} color={status.color} />
                        <ThemedText style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                        </ThemedText>
                    </View>

                    {quiz.completion_status && (
                        <ThemedText style={styles.attemptsText}>
                            Attempts: {quiz.completion_status.attempts_count}/{quiz.max_attempts}
                        </ThemedText>
                    )}
                </View>

                <Button
                    title={
                        isLocked
                            ? 'Locked'
                            : status.status === 'completed'
                                ? 'Retake Quiz'
                                : status.status === 'in_progress'
                                    ? 'Resume Quiz'
                                    : 'Start Quiz'
                    }
                    onPress={() => handleStartQuiz(quiz)}
                    disabled={isLocked}
                    style={styles.startButton}
                />
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText>Loading quizzes...</ThemedText>
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
                <ThemedText style={styles.headerTitle}>Chapter Quizzes</ThemedText>
                <View style={styles.placeholder} />
            </View>

            {/* Quizzes List */}
            <ScrollView style={styles.content}>
                {quizzes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={64} color={theme.colors.textSecondary} />
                        <ThemedText style={styles.emptyText}>No quizzes available</ThemedText>
                        <ThemedText style={styles.emptySubtext}>
                            Check back later for quizzes on this chapter
                        </ThemedText>
                    </View>
                ) : (
                    quizzes.map((quiz, index) => renderQuizCard(quiz, index))
                )}
            </ScrollView>
        </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
        opacity: 0.7,
    },
    emptySubtext: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
    },
    quizCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    lockedCard: {
        opacity: 0.6,
    },
    quizHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    quizNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quizNumberText: {
        fontSize: 14,
        fontWeight: '600',
    },
    quizInfo: {
        flex: 1,
    },
    quizTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    quizDescription: {
        fontSize: 14,
        opacity: 0.8,
    },
    quizMeta: {
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 4,
    },
    metaText: {
        fontSize: 12,
        marginLeft: 4,
        opacity: 0.7,
    },
    requiredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    requiredText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    quizStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    attemptsText: {
        fontSize: 12,
        opacity: 0.7,
    },
    startButton: {
        marginTop: 4,
    },
});
