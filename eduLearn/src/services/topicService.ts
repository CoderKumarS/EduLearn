import api from './api';
import { Topic, TopicReorderRequest } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

/**
 * Topic Service
 * Handles all API calls related to topics
 */

class TopicService {
    private baseUrl = '/topics';

    /**
     * Get all topics with optional filtering
     */
    async getTopics(chapterId?: number): Promise<Topic[]> {
        try {
            const params = chapterId ? { chapter: chapterId } : {};
            const response = await api.get<Topic[]>(this.baseUrl + '/', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get a single topic by ID
     */
    async getTopic(topicId: number): Promise<Topic> {
        try {
            const response = await api.get<Topic>(`${this.baseUrl}/${topicId}/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create a new topic
     */
    async createTopic(topicData: Partial<Topic>): Promise<Topic> {
        try {
            const response = await api.post<Topic>(this.baseUrl + '/', topicData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update an existing topic
     */

    async updateTopic(topicId: number, topicData: Partial<Topic>): Promise<Topic> {
        try {
            const response = await api.put<Topic>(`${this.baseUrl}/${topicId}/`, topicData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Partially update a topic
     */
    async patchTopic(topicId: number, topicData: Partial<Topic>): Promise<Topic> {
        try {
            const response = await api.patch<Topic>(`${this.baseUrl}/${topicId}/`, topicData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete a topic
     */
    async deleteTopic(topicId: number): Promise<void> {
        try {
            await api.delete(`${this.baseUrl}/${topicId}/`);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Mark a topic as complete for the current student
     */
    async markTopicComplete(topicId: number): Promise<{ message: string; topic_id: number; is_completed: boolean; completed_at: string }> {
        try {
            const response = await api.post(`${this.baseUrl}/${topicId}/mark_complete/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Reorder topics within a chapter
     */
    async reorderTopics(topicOrders: TopicReorderRequest): Promise<{ message: string; topics: Topic[] }> {
        try {
            const response = await api.post(`${this.baseUrl}/reorder/`, topicOrders);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get progress for a specific topic
     */
    async getTopicProgress(topicId: number): Promise<{
        topic_id: number;
        is_completed: boolean;
        time_spent_minutes: number;
        last_accessed: string | null;
        completed_at: string | null;
    }> {
        try {
            const response = await api.get(`${this.baseUrl}/${topicId}/get_progress/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export default new TopicService();
