import api from './api';
import {
    Quiz,
    Question,
    Option,
    QuizAttempt,
    StudentAnswer,
    QuizSubmission,
    QuizSubmissionResponse,
} from '../types/course';

// Quiz endpoints
export const quizService = {
    // Get all quizzes (with filters)
    getQuizzes: async (params?: {
        course?: number;
        chapter?: number;
        is_active?: boolean;
    }) => {
        const response = await api.get<Quiz[]>('/quizzes/', { params });
        return response.data;
    },

    // Get quiz by ID
    getQuizById: async (id: number) => {
        const response = await api.get<Quiz>(`/quizzes/${id}/`);
        return response.data;
    },

    // Create quiz (instructor only)
    createQuiz: async (quizData: Partial<Quiz>) => {
        const response = await api.post<Quiz>('/quizzes/', quizData);
        return response.data;
    },

    // Update quiz (instructor only)
    updateQuiz: async (id: number, quizData: Partial<Quiz>) => {
        const response = await api.put<Quiz>(`/quizzes/${id}/`, quizData);
        return response.data;
    },

    // Delete quiz (instructor only)
    deleteQuiz: async (id: number) => {
        await api.delete(`/quizzes/${id}/`);
    },

    // Get quiz questions
    getQuizQuestions: async (quizId: number) => {
        const response = await api.get<Question[]>(`/quizzes/${quizId}/questions/`);
        return response.data;
    },

    // Submit quiz
    submitQuiz: async (quizId: number, submission: QuizSubmission) => {
        const response = await api.post<QuizSubmissionResponse>(
            `/quizzes/${quizId}/submit/`,
            submission
        );
        return response.data;
    },

    // Get quiz results
    getQuizResults: async (quizId: number) => {
        const response = await api.get<QuizAttempt[]>(`/quizzes/${quizId}/results/`);
        return response.data;
    },

    // Get quiz attempts history
    getQuizAttempts: async (quizId: number) => {
        const response = await api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts/`);
        return response.data;
    },

    // Get all quizzes for a chapter (NEW)
    getChapterQuizzes: async (chapterId: number) => {
        const response = await api.get<Quiz[]>(`/api/chapters/${chapterId}/quizzes/`);
        return response.data;
    },

    // Reorder quizzes (NEW)
    reorderQuizzes: async (quizOrders: { id: number; order: number }[]) => {
        const response = await api.post('/api/quizzes/reorder/', { quiz_orders: quizOrders });
        return response.data;
    },
};

// Question endpoints
export const questionService = {
    // Get all questions (with filters)
    getQuestions: async (params?: { quiz?: number }) => {
        const response = await api.get<Question[]>('/questions/', { params });
        return response.data;
    },

    // Get question by ID
    getQuestionById: async (id: number) => {
        const response = await api.get<Question>(`/questions/${id}/`);
        return response.data;
    },

    // Create question (instructor only)
    createQuestion: async (questionData: Partial<Question>) => {
        const response = await api.post<Question>('/questions/', questionData);
        return response.data;
    },

    // Update question (instructor only)
    updateQuestion: async (id: number, questionData: Partial<Question>) => {
        const response = await api.put<Question>(`/questions/${id}/`, questionData);
        return response.data;
    },

    // Delete question (instructor only)
    deleteQuestion: async (id: number) => {
        await api.delete(`/questions/${id}/`);
    },

    // Get question options
    getQuestionOptions: async (questionId: number) => {
        const response = await api.get<Option[]>(`/questions/${questionId}/options/`);
        return response.data;
    },
};

// Option endpoints
export const optionService = {
    // Get all options (with filters)
    getOptions: async (params?: { question?: number }) => {
        const response = await api.get<Option[]>('/options/', { params });
        return response.data;
    },

    // Get option by ID
    getOptionById: async (id: number) => {
        const response = await api.get<Option>(`/options/${id}/`);
        return response.data;
    },

    // Create option (instructor only)
    createOption: async (optionData: Partial<Option>) => {
        const response = await api.post<Option>('/options/', optionData);
        return response.data;
    },

    // Update option (instructor only)
    updateOption: async (id: number, optionData: Partial<Option>) => {
        const response = await api.put<Option>(`/options/${id}/`, optionData);
        return response.data;
    },

    // Delete option (instructor only)
    deleteOption: async (id: number) => {
        await api.delete(`/options/${id}/`);
    },
};

// Quiz Attempt endpoints
export const quizAttemptService = {
    // Get all quiz attempts
    getQuizAttempts: async (params?: {
        student?: number;
        quiz?: number;
        is_completed?: boolean;
    }) => {
        const response = await api.get<QuizAttempt[]>('/quiz-attempts/', { params });
        return response.data;
    },

    // Get quiz attempt by ID
    getQuizAttemptById: async (id: number) => {
        const response = await api.get<QuizAttempt>(`/quiz-attempts/${id}/`);
        return response.data;
    },

    // Get attempts for specific quiz
    getAttemptsForQuiz: async (quizId: number) => {
        const response = await api.get<QuizAttempt[]>(`/quiz-attempts/quiz/${quizId}/`);
        return response.data;
    },
};

// Student Answer endpoints
export const studentAnswerService = {
    // Get all student answers
    getStudentAnswers: async (params?: { student?: number; question?: number }) => {
        const response = await api.get<StudentAnswer[]>('/student-answers/', { params });
        return response.data;
    },

    // Get student answer by ID
    getStudentAnswerById: async (id: number) => {
        const response = await api.get<StudentAnswer>(`/student-answers/${id}/`);
        return response.data;
    },

    // Get answers for specific quiz
    getAnswersForQuiz: async (quizId: number) => {
        const response = await api.get<StudentAnswer[]>(`/student-answers/quiz/${quizId}/`);
        return response.data;
    },
};

export default {
    quiz: quizService,
    question: questionService,
    option: optionService,
    quizAttempt: quizAttemptService,
    studentAnswer: studentAnswerService,
};
