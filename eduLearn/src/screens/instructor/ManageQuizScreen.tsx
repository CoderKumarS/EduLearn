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
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { quizService, questionService, optionService } from '../../services/quizService';
import { Quiz, Question, Option } from '../../types/course';
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
            setQuizzes(data.sort((a, b) => a.order - b.order));
        } catch (error) {
            handleApiError(error);
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
            setQuestions(questionsData.sort((a, b) => a.order - b.order));
            setShowQuestionsModal(true);
        } catch (error) {
            handleApiError(error);
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

            // Create options for multiple choice questions
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
                                        style={styles.iconButton}
                                    >
                                        <Ionicons name="list-outline" size={20} color={theme.colors.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleEditQuiz(quiz)}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteQuiz(quiz)}
                                        style={styles.iconButton}
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
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                                    <ThemedText style={styles.metaText}>{quiz.time_limit_minutes} min</ThemedText>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="help-circle-outline" size={16} color={theme.colors.textSecondary} />
                                    <ThemedText style={styles.metaText}>{quiz.question_count || 0} questions</ThemedText>
                                </View>
                                {quiz.is_required && (
                                    <View style={styles.metaItem}>
                                        <Ionicons name="star" size={16} color={theme.colors.warning} />
                                        <ThemedText style={styles.metaText}>Required</ThemedText>
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
                        <TouchableOpacity onPress={() => setShowQuestionsModal(false)}>
                            <ThemedText style={styles.cancelText}>Close</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>
                            {selectedQuiz?.title} - Questions
                        </ThemedText>
                        <TouchableOpacity onPress={handleAddQuestion}>
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
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    quizHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    quizInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    quizOrder: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
        opacity: 0.7,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    quizActions: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 8,
    },
    quizDescription: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 8,
    },
    quizMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    cancelText: {
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
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
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    questionInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    questionOrder: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
        opacity: 0.7,
    },
    questionText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    questionActions: {
        flexDirection: 'row',
    },
    questionMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
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
