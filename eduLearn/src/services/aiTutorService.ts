import api from './api';
import { ChatMessage, ChatSession, ChatContext } from '../types/chat';

class AITutorService {
    // Create new conversation
    async createConversation(title?: string, courseId?: number): Promise<{ id: string; created_at: string }> {
        try {
            const response = await api.post('/tutor/conversations/', {
                title: title || 'New Conversation',
                course_id: courseId,
            });
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Get all conversations
    async getConversations(): Promise<any[]> {
        try {
            const response = await api.get('/tutor/conversations/');
            return response.data.conversations || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    // Get conversation details with messages
    async getConversation(conversationId: string): Promise<any> {
        try {
            const response = await api.get(`/tutor/conversations/${conversationId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw error;
        }
    }

    // Get messages for a conversation
    async getMessages(conversationId: string): Promise<any[]> {
        try {
            const response = await api.get(`/tutor/conversations/${conversationId}/messages/`);
            return response.data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    // Send message to AI Tutor
    async sendMessage(
        message: string,
        conversationId?: string,
        courseId?: number,
        chapterId?: number
    ): Promise<{
        conversation_id: string;
        message_id: string;
        response: string;
        timestamp: string;
    }> {
        try {
            const payload: any = { message: message?.trim() || '' };

            if (conversationId) {
                payload.conversation_id = conversationId;
            }
            if (courseId) {
                payload.course_id = courseId;
            }
            if (chapterId) {
                payload.chapter_id = chapterId;
            }
            const response = await api.post('/tutor/chat/', payload);
            return response.data;
        } catch (error: any) {
            console.error('Error sending message to AI Tutor:', error);
            console.error('Error response:', error.response?.data);

            // Handle specific error cases
            if (error.response?.status === 503) {
                throw new Error('AI service is temporarily unavailable. Please try again later.');
            } else if (error.response?.status === 429) {
                const retryAfter = error.response?.data?.retry_after || 60;
                throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
            } else if (error.response?.status === 401) {
                throw new Error('Please log in to use the AI Tutor.');
            }

            throw new Error(error.response?.data?.error || 'Failed to send message');
        }
    }

    // Legacy methods for backward compatibility
    async createChatSession(context?: ChatContext, courseId?: number): Promise<ChatSession> {
        try {
            const conversation = await this.createConversation('New Chat', courseId);
            return {
                id: conversation.id,
                userId: 'current-user',
                startedAt: conversation.created_at,
                messages: [],
                context,
            };
        } catch (error) {
            console.error('Error creating chat session:', error);
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
        try {
            const conversation = await this.getConversation(sessionId);
            return {
                id: conversation.id,
                userId: conversation.student,
                startedAt: conversation.created_at,
                messages: conversation.messages || [],
                context: conversation.course ? { currentCourse: conversation.course.toString() } : undefined,
            };
        } catch (error) {
            throw error;
        }
    }

    async getChatSessions(): Promise<ChatSession[]> {
        try {
            const conversations = await this.getConversations();
            return conversations.map(conv => ({
                id: conv.id,
                userId: conv.student,
                startedAt: conv.created_at,
                messages: [],
                context: conv.course ? { currentCourse: conv.course.toString() } : undefined,
            }));
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
            return [];
        }
    }

    async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
        try {
            const messages = await this.getMessages(sessionId);
            return messages.map(msg => ({
                id: msg.id,
                message: msg.content,
                isUser: msg.role === 'user',
                timestamp: msg.timestamp,
            }));
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
