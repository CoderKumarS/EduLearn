import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { QuizOption } from '../../components/quiz/QuizOption';
import { courseService } from '../../services/courseService';
import quizService from '../../services/quizService';
import { Quiz, Question, QuizSubmission } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';

interface QuizScreenProps {
    quizId: number;
    onNavigateBack: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
    quizId,
    onNavigateBack,
}) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [quizResults, setQuizResults] = useState<any>(null);

    useEffect(() => {
        loadQuizData();
    }, [quizId]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (quizStarted && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (quizStarted && timeLeft === 0) {
            handleSubmitQuiz();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, quizStarted]);

    const loadQuizData = async () => {
        try {
            const [quizData, questionsData] = await Promise.all([
                quizService.quiz.getQuizById(quizId),
                quizService.quiz.getQuizQuestions(quizId),
            ]);

            setQuiz(quizData);
            setQuestions(questionsData || []);
            setTimeLeft(quizData.time_limit_minutes * 60); // Convert minutes to seconds
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Error loading quiz:', error);
            Alert.alert('Error', apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
    };

    const handleAnswerSelect = (questionId: string, optionId: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!quiz) return;

        // Check if all questions are answered
        const unansweredQuestions = questions.filter(q => !selectedAnswers[q.id]);
        if (unansweredQuestions.length > 0 && timeLeft > 0) {
            Alert.alert(
                'Incomplete Quiz',
                `You have ${unansweredQuestions.length} unanswered questions. Submit anyway?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Submit', onPress: submitQuiz },
                ]
            );
            return;
        }

        submitQuiz();
    };

    const submitQuiz = async () => {
        if (!quiz) return;

        setSubmitting(true);
        try {
            const submission: QuizSubmission = {
                answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
                    question_id: parseInt(questionId),
                    selected_option_id: parseInt(optionId),
                    time_taken_seconds: 30,
                })),
            };

            const result = await quizService.quiz.submitQuiz(quiz.id, submission);
            setQuizResults(result);
            setShowResults(true);
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Quiz submission error:', error);
            Alert.alert('Error', apiError.message || 'Failed to submit quiz. Please check your answers and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Last question, submit quiz
            handleSubmitQuiz();
        }
    };

    const handleFlagQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion) {
            setFlaggedQuestions(prev => {
                const newSet = new Set(prev);
                if (newSet.has(currentQuestion.id)) {
                    newSet.delete(currentQuestion.id);
                } else {
                    newSet.add(currentQuestion.id);
                }
                return newSet;
            });
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        const answeredCount = Object.keys(selectedAnswers).length;
        return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText>Loading quiz...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (!quiz) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText>Quiz not found.</ThemedText>
                    <Button title="Go Back" onPress={onNavigateBack} />
                </View>
            </SafeAreaView>
        );
    }

    if (!quizStarted) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ThemedView style={styles.content}>
                    <View style={styles.quizIntro}>
                        <ThemedText style={styles.quizTitle}>{quiz.title}</ThemedText>

                        <View style={[styles.quizInfo, { backgroundColor: theme.colors.card }]}>
                            <ThemedText style={styles.infoTitle}>Quiz Information</ThemedText>
                            <ThemedText style={styles.infoItem}>
                                Questions: {questions.length}
                            </ThemedText>
                            <ThemedText style={styles.infoItem}>
                                Time Limit: {quiz.time_limit_minutes} minutes
                            </ThemedText>
                            <ThemedText style={styles.infoItem}>
                                Type: Multiple Choice
                            </ThemedText>
                        </View>

                        <View style={styles.instructions}>
                            <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
                            <ThemedText style={styles.instructionItem}>
                                • Answer all questions to the best of your ability
                            </ThemedText>
                            <ThemedText style={styles.instructionItem}>
                                • You can change your answers before submitting
                            </ThemedText>
                            <ThemedText style={styles.instructionItem}>
                                • The quiz will auto-submit when time runs out
                            </ThemedText>
                            <ThemedText style={styles.instructionItem}>
                                • Make sure you have a stable internet connection
                            </ThemedText>
                        </View>

                        <View style={styles.startButtonContainer}>
                            <Button
                                title="Start Quiz"
                                onPress={startQuiz}
                                style={styles.startButton}
                            />
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: theme.colors.border, borderWidth: 1 }]}
                                onPress={onNavigateBack}
                            >
                                <ThemedText style={{ textAlign: 'center' }}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (showResults && quizResults) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ThemedView style={styles.content}>
                    <View style={styles.resultsContainer}>
                        <View style={[styles.resultsHeader, { backgroundColor: theme.colors.card }]}>
                            <Ionicons
                                name={quizResults.score >= 70 ? "checkmark-circle" : "close-circle"}
                                size={80}
                                color={quizResults.score >= 70 ? theme.colors.success : theme.colors.error}
                            />
                            <ThemedText style={styles.resultsTitle}>Quiz Completed!</ThemedText>
                            <ThemedText style={styles.resultsScore}>
                                Your Score: {quizResults.score}%
                            </ThemedText>
                            <ThemedText style={styles.resultsMessage}>
                                {quizResults.message}
                            </ThemedText>
                        </View>

                        <View style={[styles.resultsStats, { backgroundColor: theme.colors.card }]}>
                            <View style={styles.statItem}>
                                <ThemedText style={styles.statLabel}>Total Questions</ThemedText>
                                <ThemedText style={styles.statValue}>{questions.length}</ThemedText>
                            </View>
                            <View style={styles.statItem}>
                                <ThemedText style={styles.statLabel}>Correct Answers</ThemedText>
                                <ThemedText style={[styles.statValue, { color: theme.colors.success }]}>
                                    {Math.round((quizResults.score / 100) * questions.length)}
                                </ThemedText>
                            </View>
                            <View style={styles.statItem}>
                                <ThemedText style={styles.statLabel}>Incorrect Answers</ThemedText>
                                <ThemedText style={[styles.statValue, { color: theme.colors.error }]}>
                                    {questions.length - Math.round((quizResults.score / 100) * questions.length)}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={styles.resultsActions}>
                            <Button
                                title="Back to Course"
                                onPress={onNavigateBack}
                                style={styles.resultsButton}
                            />
                        </View>
                    </View>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Quiz Header */}
            <View style={[styles.quizHeader, { backgroundColor: theme.colors.card }]}>
                <View style={styles.headerInfo}>
                    <ThemedText style={styles.headerTitle}>{quiz.title}</ThemedText>
                    <ThemedText variant="secondary" style={styles.headerSubtitle}>
                        Question {currentQuestionIndex + 1} / {questions.length}
                    </ThemedText>
                </View>

                <View style={styles.timerContainer}>
                    <Ionicons
                        name="time-outline"
                        size={20}
                        color={timeLeft < 300 ? theme.colors.error : theme.colors.text}
                        style={styles.timerIcon}
                    />
                    <ThemedText style={[
                        styles.timer,
                        { color: timeLeft < 300 ? theme.colors.error : theme.colors.text }
                    ]}>
                        {formatTime(timeLeft)}
                    </ThemedText>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            backgroundColor: theme.colors.primary,
                            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                        }
                    ]}
                />
            </View>

            {/* Current Question */}
            <ScrollView style={styles.scrollView}>
                <ThemedView style={styles.questionsContainer}>
                    {questions[currentQuestionIndex] && (
                        <View style={styles.questionCard}>
                            <ThemedText style={styles.questionText}>
                                {questions[currentQuestionIndex].question_text}
                            </ThemedText>

                            <View style={styles.optionsContainer}>
                                {questions[currentQuestionIndex].options?.map((option, index) => {
                                    const labels: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
                                    return (
                                        <QuizOption
                                            key={option.id}
                                            label={labels[index]}
                                            text={option.option_text}
                                            isSelected={selectedAnswers[questions[currentQuestionIndex].id.toString()] === option.id.toString()}
                                            onSelect={() => handleAnswerSelect(questions[currentQuestionIndex].id.toString(), option.id.toString())}
                                        />
                                    );
                                }) || []}
                            </View>

                            {/* Flag Question Button */}
                            <TouchableOpacity
                                style={[
                                    styles.flagButton,
                                    {
                                        backgroundColor: flaggedQuestions.has(questions[currentQuestionIndex].id)
                                            ? theme.colors.warning + '20'
                                            : theme.colors.surface,
                                        borderColor: flaggedQuestions.has(questions[currentQuestionIndex].id)
                                            ? theme.colors.warning
                                            : theme.colors.border,
                                    }
                                ]}
                                onPress={handleFlagQuestion}
                                accessibilityLabel="Flag question for review"
                                accessibilityRole="button"
                            >
                                <Ionicons
                                    name={flaggedQuestions.has(questions[currentQuestionIndex].id) ? "flag" : "flag-outline"}
                                    size={20}
                                    color={flaggedQuestions.has(questions[currentQuestionIndex].id) ? theme.colors.warning : theme.colors.text}
                                />
                                <ThemedText style={[
                                    styles.flagButtonText,
                                    {
                                        color: flaggedQuestions.has(questions[currentQuestionIndex].id)
                                            ? theme.colors.warning
                                            : theme.colors.text
                                    }
                                ]}>
                                    {flaggedQuestions.has(questions[currentQuestionIndex].id)
                                        ? 'Flagged for Review'
                                        : 'Flag Question for Review'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </ThemedView>
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={[styles.navigationContainer, { backgroundColor: theme.colors.card }]}>
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        styles.outlineButton,
                        { borderColor: theme.colors.border },
                        currentQuestionIndex === 0 && styles.buttonDisabled
                    ]}
                    onPress={handlePreviousQuestion}
                    disabled={Boolean(currentQuestionIndex === 0)}
                >
                    <ThemedText style={{ textAlign: 'center' }}>Previous</ThemedText>
                </TouchableOpacity>
                <Button
                    title={currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                    onPress={handleNextQuestion}
                    loading={Boolean(submitting && currentQuestionIndex === questions.length - 1)}
                    style={styles.navButton}
                />
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    quizIntro: {
        flex: 1,
        justifyContent: 'center',
    },
    quizTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32,
    },
    quizInfo: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoItem: {
        fontSize: 16,
        marginBottom: 8,
    },
    instructions: {
        marginBottom: 32,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    instructionItem: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    startButtonContainer: {
        gap: 12,
    },
    startButton: {
        marginBottom: 8,
    },
    cancelButton: {
        marginBottom: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButton: {
        borderWidth: 1,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    quizHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timerIcon: {
        marginRight: 4,
    },
    timer: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressContainer: {
        height: 4,
        marginHorizontal: 20,
        borderRadius: 2,
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    scrollView: {
        flex: 1,
    },
    questionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    questionCard: {
        padding: 20,
    },
    questionText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 24,
        lineHeight: 28,
    },
    optionsContainer: {
        marginBottom: 24,
    },
    flagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    flagButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    navigationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    navButton: {
        flex: 1,
    },
    resultsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 24,
    },
    resultsHeader: {
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        gap: 16,
    },
    resultsTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resultsScore: {
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resultsMessage: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
    },
    resultsStats: {
        padding: 24,
        borderRadius: 16,
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 16,
        opacity: 0.8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    resultsActions: {
        gap: 12,
    },
    resultsButton: {
        marginBottom: 8,
    },
});
