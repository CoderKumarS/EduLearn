import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { quizService, questionService, optionService } from '../../services/quizService';
import { Quiz, Question } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';

interface ManageQuizScreenProps {
    chapterId: number;
    onNavigateBack: () => void;
}

export const ManageQuizScreen: React.FC<ManageQuizScreenProps> = ({
    chapterId,
    onNavigateBack,
}) => {
    const { theme } = useTheme();
    const { logout } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [questionFormData, setQuestionFormData] = useState({
        question_text: '',
        question_type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'short_answer',
        points: '10',
        explanation: '',
    });
    const [options, setOptions] = useState<Array<{ option_text: string; is_correct: boolean }>>([
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        time_limit_minutes: '30',
        passing_score: '70',
        max_attempts: '3',
        order: '1',
        is_required: true,
    });

    useEffect(() => {
        loadQuizzes();
    }, [chapterId]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizService.getQuizzes({ chapter: chapterId });

            // Handle both paginated and non-paginated responses
            const quizzesList = Array.isArray(data)
                ? data
                : (data && typeof data === 'object' && 'results' in data ? (data as any).results : []);

            setQuizzes(quizzesList.sort((a: Quiz, b: Quiz) => a.order - b.order));
        } catch (error: any) {
            console.error('Error loading quizzes:', error);
            const apiError = handleApiError(error);

            // Handle authentication errors
            if (apiError.status === 401) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                logout();
                                onNavigateBack();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Error', apiError.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuiz = () => {
        setEditingQuiz(null);
        setFormData({
            title: '',
            description: '',
            time_limit_minutes: '30',
            passing_score: '70',
            max_attempts: '3',
            order: (quizzes.length + 1).toString(),
            is_required: true,
        });
        setShowAddModal(true);
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            Alert.alert('Validation Error', 'Quiz title is required');
            return false;
        }

        const timeLimit = parseInt(formData.time_limit_minutes);
        if (isNaN(timeLimit) || timeLimit <= 0) {
            Alert.alert('Validation Error', 'Time limit must be a positive number');
            return false;
        }

        const passingScore = parseInt(formData.passing_score);
        if (isNaN(passingScore) || passingScore < 0 || passingScore > 100) {
            Alert.alert('Validation Error', 'Passing score must be between 0 and 100');
            return false;
        }

        const maxAttempts = parseInt(formData.max_attempts);
        if (isNaN(maxAttempts) || maxAttempts <= 0) {
            Alert.alert('Validation Error', 'Max attempts must be a positive number');
            return false;
        }

        const order = parseInt(formData.order);
        if (isNaN(order) || order <= 0) {
            Alert.alert('Validation Error', 'Order must be a positive number');
            return false;
        }

        return true;
    };

    const handleSaveQuiz = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const quizData = {
                chapter: chapterId,
                title: formData.title,
                description: formData.description,
                time_limit_minutes: parseInt(formData.time_limit_minutes),
                passing_score: parseInt(formData.passing_score),
                max_attempts: parseInt(formData.max_attempts),
                order: parseInt(formData.order),
                is_required: formData.is_required,
                is_active: true,
            };

            if (editingQuiz) {
                await quizService.updateQuiz(editingQuiz.id, quizData);
            } else {
                await quizService.createQuiz(quizData);
            }

            setShowAddModal(false);
            loadQuizzes();
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleEditQuiz = (quiz: Quiz) => {
        setEditingQuiz(quiz);
        setFormData({
            title: quiz.title,
            description: quiz.description || '',
            time_limit_minutes: quiz.time_limit_minutes.toString(),
            passing_score: quiz.passing_score.toString(),
            max_attempts: quiz.max_attempts.toString(),
            order: quiz.order.toString(),
            is_required: quiz.is_required,
        });
        setShowAddModal(true);
    };

    const handleDeleteQuiz = (quiz: Quiz) => {
        Alert.alert(
            'Delete Quiz',
            `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await quizService.deleteQuiz(quiz.id);
                            loadQuizzes();
                        } catch (error) {
                            handleApiError(error);
                        }
                    },
                },
            ]
        );
    };

    const handleManageQuestions = async (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        try {
            const questionsData = await questionService.getQuestions({ quiz: quiz.id });

            // Handle both paginated and non-paginated responses
            const questionsList = Array.isArray(questionsData)
                ? questionsData
                : (questionsData && typeof questionsData === 'object' && 'results' in questionsData ? (questionsData as any).results : []);

            setQuestions(questionsList.sort((a: Question, b: Question) => a.order - b.order));
            setShowQuestionsModal(true);
        } catch (error: any) {
            console.error('Error loading questions:', error);
            const apiError = handleApiError(error);

            // Handle authentication errors
            if (apiError.status === 401) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                logout();
                                onNavigateBack();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Error', apiError.message);
            }
        }
    };

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setQuestionFormData({
            question_text: '',
            question_type: 'multiple_choice',
            points: '10',
            explanation: '',
        });
        setOptions([
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ]);
        setShowQuestionForm(true);
    };

    const handleQuestionTypeChange = (type: 'multiple_choice' | 'true_false' | 'short_answer') => {
        setQuestionFormData({ ...questionFormData, question_type: type });

        // Initialize options based on question type
        if (type === 'true_false') {
            setOptions([
                { option_text: 'True', is_correct: false },
                { option_text: 'False', is_correct: false },
            ]);
        } else if (type === 'multiple_choice') {
            setOptions([
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
            ]);
        }
    };

    const handleEditQuestion = async (question: Question) => {
        setEditingQuestion(question);
        setQuestionFormData({
            question_text: question.question_text,
            question_type: question.question_type,
            points: question.points.toString(),
            explanation: question.explanation || '',
        });

        if (question.options && question.options.length > 0) {
            setOptions(question.options.map(opt => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
            })));
        }
        setShowQuestionForm(true);
    };

    const handleSaveQuestion = async () => {
        if (!questionFormData.question_text.trim()) {
            Alert.alert('Validation Error', 'Question text is required');
            return;
        }

        if (questionFormData.question_type === 'multiple_choice') {
            const validOptions = options.filter(opt => opt.option_text.trim());
            if (validOptions.length < 2) {
                Alert.alert('Validation Error', 'At least 2 options are required');
                return;
            }
            if (!validOptions.some(opt => opt.is_correct)) {
                Alert.alert('Validation Error', 'At least one option must be marked as correct');
                return;
            }
        }

        if (questionFormData.question_type === 'true_false') {
            if (!options.some(opt => opt.is_correct)) {
                Alert.alert('Validation Error', 'Please select the correct answer (True or False)');
                return;
            }
        }

        try {
            const questionData = {
                quiz: selectedQuiz!.id,
                question_text: questionFormData.question_text,
                question_type: questionFormData.question_type,
                points: parseInt(questionFormData.points) || 10,
                explanation: questionFormData.explanation,
                order: editingQuestion ? editingQuestion.order : questions.length + 1,
            };

            let savedQuestion: Question;
            if (editingQuestion) {
                savedQuestion = await questionService.updateQuestion(editingQuestion.id, questionData);

                // Delete old options and create new ones
                if (editingQuestion.options) {
                    for (const opt of editingQuestion.options) {
                        await optionService.deleteOption(opt.id);
                    }
                }
            } else {
                savedQuestion = await questionService.createQuestion(questionData);
            }

            // Create options for multiple choice and true/false questions
            if (questionFormData.question_type === 'multiple_choice') {
                const validOptions = options.filter(opt => opt.option_text.trim());
                for (let i = 0; i < validOptions.length; i++) {
                    await optionService.createOption({
                        question: savedQuestion.id,
                        option_text: validOptions[i].option_text,
                        is_correct: validOptions[i].is_correct,
                        order: i + 1,
                    });
                }
            } else if (questionFormData.question_type === 'true_false') {
                // Create True and False options
                await optionService.createOption({
                    question: savedQuestion.id,
                    option_text: 'True',
                    is_correct: options[0]?.is_correct || false,
                    order: 1,
                });
                await optionService.createOption({
                    question: savedQuestion.id,
                    option_text: 'False',
                    is_correct: options[1]?.is_correct || false,
                    order: 2,
                });
            }

            setShowQuestionForm(false);
            if (selectedQuiz) {
                handleManageQuestions(selectedQuiz);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleDeleteQuestion = (question: Question) => {
        Alert.alert(
            'Delete Question',
            'Are you sure you want to delete this question?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await questionService.deleteQuestion(question.id);
                            if (selectedQuiz) {
                                handleManageQuestions(selectedQuiz);
                            }
                        } catch (error) {
                            handleApiError(error);
                        }
                    },
                },
            ]
        );
    };

    const handleReorderQuestion = async (questionId: number, direction: 'up' | 'down') => {
        const index = questions.findIndex((q) => q.id === questionId);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) {
            return;
        }

        const newQuestions = [...questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];

        try {
            // Update order for both questions
            await questionService.updateQuestion(newQuestions[index].id, { order: index + 1 });
            await questionService.updateQuestion(newQuestions[targetIndex].id, { order: targetIndex + 1 });
            setQuestions(newQuestions);
        } catch (error) {
            handleApiError(error);
        }
    };

    const addOption = () => {
        setOptions([...options, { option_text: '', is_correct: false }]);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Manage Quizzes</ThemedText>
                <TouchableOpacity onPress={handleAddQuiz} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Quizzes List */}
            <ScrollView style={styles.content}>
                {quizzes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={64} color={theme.colors.textSecondary} />
                        <ThemedText style={styles.emptyText}>No quizzes yet</ThemedText>
                        <Button title="Add First Quiz" onPress={handleAddQuiz} />
                    </View>
                ) : (
                    quizzes.map((quiz, index) => (
                        <View
                            key={quiz.id}
                            style={[styles.quizCard, { backgroundColor: theme.colors.card }]}
                        >
                            <View style={styles.quizHeader}>
                                <View style={styles.quizInfo}>
                                    <ThemedText style={styles.quizOrder}>#{index + 1}</ThemedText>
                                    <ThemedText style={styles.quizTitle}>{quiz.title}</ThemedText>
                                </View>
                                <View style={styles.quizActions}>
                                    <TouchableOpacity
                                        onPress={() => handleManageQuestions(quiz)}
                                        style={[styles.iconButton, { backgroundColor: theme.colors.info + '15' }]}
                                    >
                                        <Ionicons name="list-outline" size={20} color={theme.colors.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleEditQuiz(quiz)}
                                        style={[styles.iconButton, { backgroundColor: theme.colors.primary + '15' }]}
                                    >
                                        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteQuiz(quiz)}
                                        style={[styles.iconButton, { backgroundColor: theme.colors.error + '15' }]}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {quiz.description && (
                                <ThemedText style={styles.quizDescription} numberOfLines={2}>
                                    {quiz.description}
                                </ThemedText>
                            )}
                            <View style={styles.quizMeta}>
                                <View style={[styles.metaItem, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                                    <ThemedText style={[styles.metaText, { color: theme.colors.primary }]}>{quiz.time_limit_minutes} min</ThemedText>
                                </View>
                                <View style={[styles.metaItem, { backgroundColor: theme.colors.success + '15' }]}>
                                    <Ionicons name="help-circle-outline" size={16} color={theme.colors.success} />
                                    <ThemedText style={[styles.metaText, { color: theme.colors.success }]}>
                                        {quiz.questions?.length || quiz.question_count || 0} questions
                                    </ThemedText>
                                </View>
                                {quiz.is_required && (
                                    <View style={[styles.metaItem, { backgroundColor: theme.colors.warning + '15' }]}>
                                        <Ionicons name="star" size={16} color={theme.colors.warning} />
                                        <ThemedText style={[styles.metaText, { color: theme.colors.warning }]}>Required</ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddModal(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>
                            {editingQuiz ? 'Edit Quiz' : 'Add Quiz'}
                        </ThemedText>
                        <TouchableOpacity onPress={handleSaveQuiz}>
                            <ThemedText style={[styles.saveText, { color: theme.colors.primary }]}>
                                Save
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Title *</ThemedText>
                            <Input
                                value={formData.title}
                                onChangeText={(text: string) => setFormData({ ...formData, title: text })}
                                placeholder="Enter quiz title"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Description</ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    },
                                ]}
                                value={formData.description}
                                onChangeText={(text: string) => setFormData({ ...formData, description: text })}
                                placeholder="Enter quiz description"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Time Limit (minutes) *</ThemedText>
                            <Input
                                value={formData.time_limit_minutes}
                                onChangeText={(text: string) => setFormData({ ...formData, time_limit_minutes: text })}
                                placeholder="30"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Passing Score (%) *</ThemedText>
                            <Input
                                value={formData.passing_score}
                                onChangeText={(text: string) => setFormData({ ...formData, passing_score: text })}
                                placeholder="70"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Max Attempts *</ThemedText>
                            <Input
                                value={formData.max_attempts}
                                onChangeText={(text: string) => setFormData({ ...formData, max_attempts: text })}
                                placeholder="3"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Order *</ThemedText>
                            <Input
                                value={formData.order}
                                onChangeText={(text: string) => setFormData({ ...formData, order: text })}
                                placeholder="1"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setFormData({ ...formData, is_required: !formData.is_required })}
                            >
                                <Ionicons
                                    name={formData.is_required ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <ThemedText style={styles.checkboxLabel}>Required Quiz</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Questions Management Modal */}
            <Modal
                visible={showQuestionsModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowQuestionsModal(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                        <TouchableOpacity onPress={() => setShowQuestionsModal(false)} style={styles.headerButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <ThemedText style={styles.modalTitle} numberOfLines={1}>
                                Questions
                            </ThemedText>
                            <ThemedText variant="secondary" style={styles.modalSubtitle} numberOfLines={1}>
                                {selectedQuiz?.title}
                            </ThemedText>
                        </View>
                        <TouchableOpacity onPress={handleAddQuestion} style={styles.headerButton}>
                            <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {questions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="help-circle-outline" size={64} color={theme.colors.textSecondary} />
                                <ThemedText style={styles.emptyText}>No questions yet</ThemedText>
                                <Button title="Add First Question" onPress={handleAddQuestion} />
                            </View>
                        ) : (
                            questions.map((question, index) => (
                                <View
                                    key={question.id}
                                    style={[styles.questionCard, { backgroundColor: theme.colors.card }]}
                                >
                                    <View style={styles.questionHeader}>
                                        <View style={styles.questionInfo}>
                                            <ThemedText style={styles.questionOrder}>Q{index + 1}</ThemedText>
                                            <ThemedText style={styles.questionText} numberOfLines={2}>
                                                {question.question_text}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.questionActions}>
                                            <TouchableOpacity
                                                onPress={() => handleReorderQuestion(question.id, 'up')}
                                                disabled={index === 0}
                                                style={styles.iconButton}
                                            >
                                                <Ionicons
                                                    name="arrow-up"
                                                    size={18}
                                                    color={index === 0 ? theme.colors.border : theme.colors.text}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleReorderQuestion(question.id, 'down')}
                                                disabled={index === questions.length - 1}
                                                style={styles.iconButton}
                                            >
                                                <Ionicons
                                                    name="arrow-down"
                                                    size={18}
                                                    color={
                                                        index === questions.length - 1
                                                            ? theme.colors.border
                                                            : theme.colors.text
                                                    }
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleEditQuestion(question)}
                                                style={styles.iconButton}
                                            >
                                                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteQuestion(question)}
                                                style={styles.iconButton}
                                            >
                                                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.questionMeta}>
                                        <ThemedText style={styles.metaText}>
                                            Type: {question.question_type.replace('_', ' ')}
                                        </ThemedText>
                                        <ThemedText style={styles.metaText}>Points: {question.points}</ThemedText>
                                        {question.options && question.options.length > 0 && (
                                            <ThemedText style={styles.metaText}>
                                                {question.options.length} options
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Question Form Modal */}
            <Modal
                visible={showQuestionForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowQuestionForm(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                        <TouchableOpacity onPress={() => setShowQuestionForm(false)}>
                            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>
                            {editingQuestion ? 'Edit Question' : 'Add Question'}
                        </ThemedText>
                        <TouchableOpacity onPress={handleSaveQuestion}>
                            <ThemedText style={[styles.saveText, { color: theme.colors.primary }]}>
                                Save
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Question Text *</ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    },
                                ]}
                                value={questionFormData.question_text}
                                onChangeText={(text: string) =>
                                    setQuestionFormData({ ...questionFormData, question_text: text })
                                }
                                placeholder="Enter question text"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Question Type *</ThemedText>
                            <View style={styles.radioGroup}>
                                {['multiple_choice', 'true_false', 'short_answer'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={styles.radioOption}
                                        onPress={() =>
                                            setQuestionFormData({
                                                ...questionFormData,
                                                question_type: type as any,
                                            })
                                        }
                                    >
                                        <Ionicons
                                            name={
                                                questionFormData.question_type === type
                                                    ? 'radio-button-on'
                                                    : 'radio-button-off'
                                            }
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                        <ThemedText style={styles.radioLabel}>
                                            {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Points *</ThemedText>
                            <Input
                                value={questionFormData.points}
                                onChangeText={(text: string) =>
                                    setQuestionFormData({ ...questionFormData, points: text })
                                }
                                placeholder="10"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Explanation (Optional)</ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    },
                                ]}
                                value={questionFormData.explanation}
                                onChangeText={(text: string) =>
                                    setQuestionFormData({ ...questionFormData, explanation: text })
                                }
                                placeholder="Explain the correct answer"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {questionFormData.question_type === 'true_false' && (
                            <View style={styles.formGroup}>
                                <ThemedText style={styles.label}>Correct Answer *</ThemedText>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity
                                        style={styles.radioOption}
                                        onPress={() => {
                                            setOptions([
                                                { option_text: 'True', is_correct: true },
                                                { option_text: 'False', is_correct: false },
                                            ]);
                                        }}
                                    >
                                        <Ionicons
                                            name={options[0]?.is_correct ? 'radio-button-on' : 'radio-button-off'}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                        <ThemedText style={styles.radioLabel}>True</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.radioOption}
                                        onPress={() => {
                                            setOptions([
                                                { option_text: 'True', is_correct: false },
                                                { option_text: 'False', is_correct: true },
                                            ]);
                                        }}
                                    >
                                        <Ionicons
                                            name={options[1]?.is_correct ? 'radio-button-on' : 'radio-button-off'}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                        <ThemedText style={styles.radioLabel}>False</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {questionFormData.question_type === 'multiple_choice' && (
                            <View style={styles.formGroup}>
                                <View style={styles.optionsHeader}>
                                    <ThemedText style={styles.label}>Options *</ThemedText>
                                    <TouchableOpacity onPress={addOption}>
                                        <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                {options.map((option, index) => (
                                    <View key={index} style={styles.optionRow}>
                                        <TouchableOpacity
                                            style={styles.checkboxContainer}
                                            onPress={() => updateOption(index, 'is_correct', !option.is_correct)}
                                        >
                                            <Ionicons
                                                name={option.is_correct ? 'checkbox' : 'square-outline'}
                                                size={24}
                                                color={theme.colors.primary}
                                            />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[
                                                styles.optionInput,
                                                {
                                                    backgroundColor: theme.colors.card,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                },
                                            ]}
                                            value={option.option_text}
                                            onChangeText={(text: string) =>
                                                updateOption(index, 'option_text', text)
                                            }
                                            placeholder={`Option ${index + 1}`}
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />
                                        {options.length > 2 && (
                                            <TouchableOpacity onPress={() => removeOption(index)}>
                                                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                <ThemedText style={styles.helperText}>
                                    Check the box to mark correct answer(s)
                                </ThemedText>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
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
    addButton: {
        padding: 8,
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
        marginBottom: 24,
        opacity: 0.7,
    },
    quizCard: {
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
    quizHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    quizInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    quizOrder: {
        fontSize: 20,
        fontWeight: '700',
        opacity: 0.3,
        minWidth: 32,
    },
    quizTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        lineHeight: 24,
    },
    quizActions: {
        flexDirection: 'row',
        gap: 4,
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
    },
    quizDescription: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 12,
        lineHeight: 20,
        marginLeft: 44,
    },
    quizMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginLeft: 44,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
    },
    manageQuestionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    manageQuestionsText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerButton: {
        padding: 4,
        minWidth: 40,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkboxLabel: {
        fontSize: 16,
        marginLeft: 12,
    },
    questionCard: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    questionInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    questionOrder: {
        fontSize: 18,
        fontWeight: '700',
        opacity: 0.4,
        minWidth: 36,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        lineHeight: 22,
    },
    questionActions: {
        flexDirection: 'row',
        gap: 4,
    },
    questionMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginLeft: 46,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    radioGroup: {
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    radioLabel: {
        fontSize: 16,
        marginLeft: 12,
    },
    optionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    optionInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    helperText: {
        fontSize: 12,
        opacity: 0.7,
        fontStyle: 'italic',
        marginTop: 4,
    },
});
