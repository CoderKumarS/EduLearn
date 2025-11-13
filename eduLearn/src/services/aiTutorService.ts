import api from './api';
import { ChatMessage, ChatSession, AITutorResponse, ChatContext } from '../types/chat';

class AITutorService {
    // Chat Sessions
    async createChatSession(context?: ChatContext): Promise<ChatSession> {
        try {
            const response = await api.post('/ai-tutor/sessions/', { context });
            return response.data;
        } catch (error) {
            console.error('Error creating chat session:', error);
            // Return mock session
            return {
                id: `session-${Date.now()}`,
                userId: 'current-user',
                startedAt: new Date().toISOString(),
                messages: [],
                context,
            };
        }
    }

    async getChatSession(sessionId: string): Promise<ChatSession> {
        const response = await api.get(`/ai-tutor/sessions/${sessionId}/`);
        return response.data;
    }

    async getChatSessions(userId: string): Promise<ChatSession[]> {
        try {
            const response = await api.get(`/ai-tutor/sessions/?user=${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
            return [];
        }
    }

    async endChatSession(sessionId: string, rating?: number): Promise<void> {
        await api.patch(`/ai-tutor/sessions/${sessionId}/`, {
            endedAt: new Date().toISOString(),
            rating,
        });
    }

    // Send Message to AI Tutor
    async sendMessage(
        sessionId: string,
        message: string,
        context?: ChatContext
    ): Promise<AITutorResponse> {
        try {
            const response = await api.post(`/ai-tutor/sessions/${sessionId}/messages/`, {
                message,
                context,
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message to AI Tutor:', error);
            // Return mock response
            return {
                message: this.generateMockResponse(message),
                confidence: 0.85,
                sources: [],
                relatedTopics: [],
            };
        }
    }

    // Get Chat History
    async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
        try {
            const response = await api.get(`/ai-tutor/sessions/${sessionId}/messages/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    }

    // Save Message
    async saveMessage(sessionId: string, message: ChatMessage): Promise<ChatMessage> {
        try {
            const response = await api.post(`/ai-tutor/sessions/${sessionId}/messages/save/`, message);
            return response.data;
        } catch (error) {
            console.error('Error saving message:', error);
            return message;
        }
    }

    // Feedback
    async submitFeedback(sessionId: string, messageId: string, feedback: 'helpful' | 'not-helpful'): Promise<void> {
        await api.post(`/ai-tutor/sessions/${sessionId}/messages/${messageId}/feedback/`, {
            feedback,
        });
    }

    // Helper method to generate mock responses
    private generateMockResponse(userMessage: string): string {
        const responses = [
            "That's a great question! Let me help you understand this concept better.",
            "I understand what you're asking. Here's what you need to know...",
            "Let me break this down for you in a simple way.",
            "That's an important topic. Let me explain it step by step.",
            "I can help you with that. Here's a detailed explanation...",
        ];

        // Simple keyword-based responses
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return "I'm here to help! " + responses[Math.floor(Math.random() * responses.length)];
        }

        if (lowerMessage.includes('explain') || lowerMessage.includes('what')) {
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lowerMessage.includes('example')) {
            return "Sure! Let me give you a practical example to illustrate this concept.";
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Get Suggested Questions
    async getSuggestedQuestions(context?: ChatContext): Promise<string[]> {
        try {
            const response = await api.post('/ai-tutor/suggestions/', { context });
            return response.data.questions;
        } catch (error) {
            console.error('Error fetching suggested questions:', error);
            return [
                "Can you explain this concept in simpler terms?",
                "What are some practical examples?",
                "How does this relate to real-world applications?",
                "What are the key points I should remember?",
            ];
        }
    }
}

export const aiTutorService = new AITutorService();
