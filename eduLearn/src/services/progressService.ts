import api from './api';
import { TopicProgress, ChapterProgressSummary } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

/**
 * Progress Service
 * Handles all API calls related to topic progress tracking
 */

class ProgressService {
    private baseUrl = '/api/topic-progress';
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private cacheTimeout = 60000; // 1 minute cache

    /**
     * Clear cache for a specific key or all cache
     */
    private clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cached data if available and not expired
     */
    private getCachedData<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data as T;
        }
        return null;
    }

    /**
     * Set cache data
     */
    private setCacheData(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    /**
     * Get all topic progress for the current user
     */
    async getTopicProgress(topicId?: number): Promise<TopicProgress[]> {
        try {
            const cacheKey = `topic-progress-${topicId || 'all'}`;
            const cached = this.getCachedData<TopicProgress[]>(cacheKey);
            if (cached) return cached;

            const params = topicId ? { topic: topicId } : {};
            const response = await api.get<TopicProgress[]>(this.baseUrl + '/', { params });

            this.setCacheData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get chapter progress summary
     */

    async getChapterProgress(chapterId: number): Promise<ChapterProgressSummary> {
        try {
            const cacheKey = `chapter-progress-${chapterId}`;
            const cached = this.getCachedData<ChapterProgressSummary>(cacheKey);
            if (cached) return cached;

            const response = await api.get<ChapterProgressSummary>(
                `${this.baseUrl}/chapter/${chapterId}/`
            );

            this.setCacheData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update progress for a topic
     */
    async updateProgress(progressId: number, data: Partial<TopicProgress>): Promise<TopicProgress> {
        try {
            const response = await api.patch<TopicProgress>(
                `${this.baseUrl}/${progressId}/`,
                data
            );

            // Clear cache after update
            this.clearCache();

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create progress record for a topic
     */
    async createProgress(data: Partial<TopicProgress>): Promise<TopicProgress> {
        try {
            const response = await api.post<TopicProgress>(this.baseUrl + '/', data);

            // Clear cache after creation
            this.clearCache();

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Bulk update - mark multiple topics as complete
     */
    async bulkMarkComplete(topicIds: number[]): Promise<{ message: string; updated_count: number }> {
        try {
            const response = await api.post(`${this.baseUrl}/bulk_update/`, {
                topic_ids: topicIds
            });

            // Clear cache after bulk update
            this.clearCache();

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Clear all cached progress data
     */
    clearAllCache(): void {
        this.clearCache();
    }
}

export default new ProgressService();
