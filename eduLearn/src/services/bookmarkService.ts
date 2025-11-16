import api from './api';
import { Bookmark } from '../types/course';

export const bookmarkService = {
    // Get all bookmarks
    getBookmarks: async (params?: { course?: number; chapter?: number }) => {
        const response = await api.get<Bookmark[]>('/bookmarks/', { params });
        return response.data;
    },

    // Get bookmark by ID
    getBookmarkById: async (id: number) => {
        const response = await api.get<Bookmark>(`/bookmarks/${id}/`);
        return response.data;
    },

    // Create bookmark
    createBookmark: async (bookmarkData: Partial<Bookmark>) => {
        const response = await api.post<Bookmark>('/bookmarks/', bookmarkData);
        return response.data;
    },

    // Delete bookmark
    deleteBookmark: async (id: number) => {
        await api.delete(`/bookmarks/${id}/`);
    },

    // Get bookmarked courses
    getBookmarkedCourses: async () => {
        const response = await api.get<Bookmark[]>('/bookmarks/courses/');
        return response.data;
    },

    // Get bookmarked chapters
    getBookmarkedChapters: async () => {
        const response = await api.get<Bookmark[]>('/bookmarks/chapters/');
        return response.data;
    },

    // Bookmark chapter (alternative endpoint via chapters)
    bookmarkChapter: async (chapterId: number) => {
        const response = await api.post<Bookmark>(`/chapters/${chapterId}/bookmark/`);
        return response.data;
    },

    // Remove chapter bookmark (alternative endpoint via chapters)
    unbookmarkChapter: async (chapterId: number) => {
        await api.delete(`/chapters/${chapterId}/unbookmark/`);
    },
};

export default bookmarkService;
