// User type
export interface User {
    id: number;
    username: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    profile_image?: string;
    bio?: string;
}

// Course types
export interface Course {
    id: number;
    title: string;
    description: string;
    instructor: User;
    instructor_name: string;
    thumbnail_image?: string;
    price: string;
    is_free: boolean;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    duration_hours: number;
    is_published: boolean;
    chapters?: Chapter[];
    enrollment_count: number;
    average_rating: number;
    ratings_count: number;
    created_at: string;
    updated_at: string;
}

export interface Topic {
    id: number;
    chapter: number;
    title: string;
    content: string;
    example: string;
    video_url: string;
    order: number;
    duration_minutes: number;
    created_at: string;
    updated_at: string;
    is_completed?: boolean;
    progress?: TopicProgress;
}

export interface TopicProgress {
    id: number;
    student: number;
    topic: number;
    topic_title?: string;
    chapter_title?: string;
    is_completed: boolean;
    time_spent_minutes: number;
    last_accessed: string;
    completed_at?: string;
}

export interface Chapter {
    id: number;
    course: number;
    title: string;
    description: string;
    content: string;
    topics: Topic[];
    order: number;
    video_url: string;
    is_free_preview: boolean;
    total_topics: number;
    total_duration: number;
    completed_topics?: number;
    progress_percentage?: number;
    quizzes?: Quiz[];
    created_at: string;
    updated_at: string;
}

export interface Quiz {
    id: number;
    course: number;
    course_title?: string;
    chapter?: number;
    chapter_title?: string;
    title: string;
    description: string;
    order: number;
    is_required: boolean;
    time_limit_minutes: number;
    passing_score: number;
    max_attempts: number;
    is_active: boolean;
    questions?: Question[];
    question_count?: number;
    attempt_count?: number;
    completion_status?: {
        is_completed: boolean;
        best_score: number;
        passed: boolean;
        attempts_count: number;
    };
    created_at: string;
}

export interface Question {
    id: number;
    quiz: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer';
    points: number;
    order: number;
    explanation: string;
    options: Option[];
    created_at: string;
}

export interface Option {
    id: number;
    question: number;
    option_text: string;
    is_correct: boolean;
    order: number;
}

export interface Enrollment {
    id: number;
    student: User;
    course: Course;
    course_id?: number;
    enrolled_at: string;
    is_active: boolean;
    completion_date?: string;
    certificate_issued: boolean;
}

export interface Progress {
    id: number;
    student: number;
    course: number;
    course_title: string;
    chapter?: number;
    chapter_title?: string;
    completed_lessons: number;
    total_lessons: number;
    score: string;
    time_spent_minutes: number;
    last_accessed: string;
    is_completed: boolean;
    progress_percent: number;
}

export interface StudentAnswer {
    id: number;
    student: number;
    question: number;
    question_text: string;
    selected_option?: number;
    selected_option_text?: string;
    answer_text: string;
    is_correct: boolean;
    answered_at: string;
    time_taken_seconds: number;
}

export interface QuizAttempt {
    id: number;
    student: number;
    student_name: string;
    quiz: number;
    quiz_title: string;
    score: string;
    max_score: string;
    percentage: string;
    time_taken_minutes: number;
    started_at: string;
    completed_at?: string;
    is_completed: boolean;
    attempt_number: number;
}

export interface Notification {
    id: number;
    user: number;
    title: string;
    message: string;
    notification_type: 'course_update' | 'quiz_result' | 'enrollment' | 'achievement' | 'reminder';
    is_read: boolean;
    created_at: string;
    action_url?: string;
}

export interface Certificate {
    id: number;
    student: number;
    student_name: string;
    course: number;
    course_title: string;
    certificate_id: string;
    issued_at: string;
    is_valid: boolean;
    pdf_file?: string;
}

export interface Discussion {
    id: number;
    course: number;
    chapter?: number;
    user: User;
    user_name: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    is_pinned: boolean;
    replies: Reply[];
    replies_count: number;
}

export interface Reply {
    id: number;
    discussion: number;
    user: User;
    user_name: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Rating {
    id: number;
    student: User;
    student_name: string;
    course: number;
    course_title?: string;
    rating: number;
    review: string;
    created_at: string;
    updated_at: string;
}

export interface Bookmark {
    id: number;
    student: number;
    course?: number;
    course_title?: string;
    chapter?: number;
    chapter_title?: string;
    created_at: string;
}

// Request/Response types
export interface QuizSubmission {
    answers: {
        question_id: number;
        selected_option_id?: number;
        answer_text?: string;
        time_taken_seconds: number;
    }[];
}

export interface ChapterProgressSummary {
    chapter_id: number;
    chapter_title: string;
    total_topics: number;
    completed_topics: number;
    progress_percentage: number;
    total_duration: number;
    time_spent: number;
}

export interface TopicReorderRequest {
    topic_orders: {
        id: number;
        order: number;
    }[];
}

export interface QuizSubmissionResponse {
    message: string;
    attempt_id: number;
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
}

// Instructor-related types
export interface InstructorStats {
    total_courses: number;
    total_students: number;
    courses: CourseWithEnrollment[];
}

export interface CourseWithEnrollment extends Course {
    enrollment_count: number;
}

// User stats
export interface UserStats {
    total_enrolled: number;
    completed_courses: number;
    total_chapters: number;
    completed_lessons: number;
    average_score: number;
    quiz_stats: {
        total_quizzes: number;
        quizzes_taken: number;
        quizzes_completed: number;
        correct_answers: number;
        wrong_answers: number;
        total_answers: number;
        accuracy: number;
    };
    recent_progress: Progress[];
}

// Helper functions
export const calculateProgressPercent = (progress: Progress): number => {
    return progress.progress_percent || 0;
};
