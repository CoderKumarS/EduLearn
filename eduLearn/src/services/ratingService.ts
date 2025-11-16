import api from './api';
import { Rating } from '../types/course';

export const ratingService = {
    // Get all ratings
    getRatings: async (params?: { course?: number; student?: number }) => {
        const response = await api.get<Rating[]>('/ratings/', { params });
        return response.data;
    },

    // Get rating by ID
    getRatingById: async (id: number) => {
        const response = await api.get<Rating>(`/ratings/${id}/`);
        return response.data;
    },

    // Create or update rating
    createOrUpdateRating: async (ratingData: Partial<Rating>) => {
        const response = await api.post<Rating>('/ratings/', ratingData);
        return response.data;
    },

    // Update rating
    updateRating: async (id: number, ratingData: Partial<Rating>) => {
        const response = await api.put<Rating>(`/ratings/${id}/`, ratingData);
        return response.data;
    },

    // Delete rating
    deleteRating: async (id: number) => {
        await api.delete(`/ratings/${id}/`);
    },

    // Get ratings for specific course
    getCourseRatings: async (courseId: number) => {
        const response = await api.get<{
            average_rating: number;
            total_ratings: number;
            ratings: Rating[];
        }>(`/ratings/course/${courseId}/`);
        return response.data;
    },

    // Rate a course (alternative endpoint via courses)
    rateCourse: async (courseId: number, rating: number, review?: string) => {
        const response = await api.post<Rating>(`/courses/${courseId}/rate/`, {
            rating,
            review: review || '',
        });
        return response.data;
    },
};

export default ratingService;
