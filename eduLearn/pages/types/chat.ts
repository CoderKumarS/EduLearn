// AI Tutor Chat Types

export interface ChatMessage {
    id: string;
    message: string;
    timestamp: string;
    isUser: boolean;
    avatar?: string;
    metadata?: {
        confidence?: number;
        sources?: string[];
        relatedTopics?: string[];
    };
}

export interface ChatSession {
    id: string;
    userId: string;
    startedAt: string;
    endedAt?: string;
    messages: ChatMessage[];
    context?: ChatContext;
    summary?: string;
    rating?: number;
}

export interface AITutorResponse {
    message: string;
    confidence: number;
    sources?: string[];
    suggestedActions?: {
        label: string;
        action: string;
        data?: any;
    }[];
    relatedTopics?: string[];
}

export interface ChatContext {
    currentCourse?: string;
    currentTopic?: string;
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    previousQuestions?: string[];
    learningGoals?: string[];
}
