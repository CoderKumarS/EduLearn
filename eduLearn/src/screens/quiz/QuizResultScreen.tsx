import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { quizAttemptService, studentAnswerService } from '../../services/quizService';
import { QuizAttempt, StudentAnswer } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';

interface QuizResultScreenProps {
    attemptId: number;
    onNavigateBack: () => void;
    onRetakeQuiz?: () => void;
}

export const QuizResultScreen: React.FC<QuizResultScreenProps> = ({
    attemptId,
    onNavigateBack,
    onRetakeQuiz,
}) => {
    const { theme } = useTheme();
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [answers, setAnswers] = useState<StudentAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            const attemptData = await quizAttemptService.getQuizAttemptById(attemptId);
            setAttempt(attemptData);

            // Load student answers for this attempt
            // Note: This assumes the API supports filtering by attempt
            // If not, we might need to adjust the API or filter client-side
            const answersData = await studentAnswerService.getStudentAnswers({
                student: attemptData.student,
            });
            setAnswers(answersData);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return theme.colors.success;
        if (percentage >= 60) return theme.colors.warning;
        return theme.colors.error;
    };

    const isPassed = attempt ? parseFloat(attempt.percentage) >= 70 : false;

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText>Loading results...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (!attempt) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText>Results not found.</ThemedText>
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
                <ThemedText style={styles.headerTitle}>Quiz Results</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Score Card */}
                <View style={[styles.scoreCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.scoreIconContainer}>
                        <Ionicons
                            name={isPassed ? 'checkmark-circle' : 'close-circle'}
                            size={80}
                            color={isPassed ? theme.colors.success : theme.colors.error}
                        />
                    </View>
                    <ThemedText style={styles.scoreTitle}>
                        {isPassed ? 'Congratulations!' : 'Keep Trying!'}
                    </ThemedText>
                    <ThemedText
                        style={[
                            styles.scorePercentage,
                            { color: getScoreColor(parseFloat(attempt.percentage)) },
                        ]}
                    >
                        {attempt.percentage}%
                    </ThemedText>
                    <ThemedText style={styles.scoreSubtitle}>
                        {isPassed ? 'You passed the quiz!' : 'You did not pass this time'}
                    </ThemedText>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="help-circle-outline" size={32} color={theme.colors.primary} />
                        <ThemedText style={styles.statValue}>{attempt.max_score}</ThemedText>
                        <ThemedText style={styles.statLabel}>Total Questions</ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="checkmark-circle-outline" size={32} color={theme.colors.success} />
                        <ThemedText style={[styles.statValue, { color: theme.colors.success }]}>
                            {attempt.score}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Correct</ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="close-circle-outline" size={32} color={theme.colors.error} />
                        <ThemedText style={[styles.statValue, { color: theme.colors.error }]}>
                            {parseFloat(attempt.max_score) - parseFloat(attempt.score)}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Incorrect</ThemedText>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="time-outline" size={32} color={theme.colors.warning} />
                        <ThemedText style={styles.statValue}>{attempt.time_taken_minutes}</ThemedText>
                        <ThemedText style={styles.statLabel}>Minutes</ThemedText>
                    </View>
                </View>

                {/* Quiz Info */}
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Quiz:</ThemedText>
                        <ThemedText style={styles.infoValue}>{attempt.quiz_title}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Attempt:</ThemedText>
                        <ThemedText style={styles.infoValue}>#{attempt.attempt_number}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Completed:</ThemedText>
                        <ThemedText style={styles.infoValue}>
                            {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString()}
                        </ThemedText>
                    </View>
                </View>

                {/* Answers Review */}
                {answers.length > 0 && (
                    <View style={styles.answersSection}>
                        <ThemedText style={styles.sectionTitle}>Answer Review</ThemedText>
                        {answers.map((answer, index) => (
                            <View
                                key={answer.id}
                                style={[
                                    styles.answerCard,
                                    {
                                        backgroundColor: theme.colors.card,
                                        borderLeftColor: answer.is_correct
                                            ? theme.colors.success
                                            : theme.colors.error,
                                    },
                                ]}
                            >
                                <View style={styles.answerHeader}>
                                    <ThemedText style={styles.answerNumber}>Q{index + 1}</ThemedText>
                                    <Ionicons
                                        name={answer.is_correct ? 'checkmark-circle' : 'close-circle'}
                                        size={24}
                                        color={answer.is_correct ? theme.colors.success : theme.colors.error}
                                    />
                                </View>
                                <ThemedText style={styles.questionText}>{answer.question_text}</ThemedText>
                                <View style={styles.answerInfo}>
                                    <ThemedText style={styles.answerLabel}>Your Answer:</ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.answerValue,
                                            {
                                                color: answer.is_correct
                                                    ? theme.colors.success
                                                    : theme.colors.error,
                                            },
                                        ]}
                                    >
                                        {answer.selected_option_text || answer.answer_text}
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {onRetakeQuiz && (
                        <Button
                            title="Retake Quiz"
                            onPress={onRetakeQuiz}
                            style={styles.actionButton}
                        />
                    )}
                    <Button
                        title="Back to Chapter"
                        onPress={onNavigateBack}
                        style={styles.actionButton}
                    />
                </View>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
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
    scoreCard: {
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreIconContainer: {
        marginBottom: 16,
    },
    scoreTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scorePercentage: {
        fontSize: 56,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreSubtitle: {
        fontSize: 16,
        opacity: 0.8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        opacity: 0.7,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    answersSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    answerCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    answerNumber: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    questionText: {
        fontSize: 16,
        marginBottom: 12,
        lineHeight: 22,
    },
    answerInfo: {
        marginTop: 8,
    },
    answerLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    answerValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        marginBottom: 8,
    },
});
