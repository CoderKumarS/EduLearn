import api from './api';
import { Discussion, Reply } from '../types/course';

export const discussionService = {
    // Get all discussions
    getDiscussions: async (params?: {
        course?: number;
        chapter?: number;
        user?: number;
        is_pinned?: boolean;
        search?: string;
    }) => {
        const response = await api.get<Discussion[]>('/discussions/', { params });
        return response.data;
    },

    // Get discussion by ID
    getDiscussionById: async (id: number) => {
        const response = await api.get<Discussion>(`/discussions/${id}/`);
        return response.data;
    },

    // Create discussion
    createDiscussion: async (discussionData: Partial<Discussion>) => {
        const response = await api.post<Discussion>('/discussions/', discussionData);
        return response.data;
    },

    // Update discussion
    updateDiscussion: async (id: number, discussionData: Partial<Discussion>) => {
        const response = await api.put<Discussion>(`/discussions/${id}/`, discussionData);
        return response.data;
    },

    // Delete discussion
    deleteDiscussion: async (id: number) => {
        await api.delete(`/discussions/${id}/`);
    },

    // Get discussion replies
    getDiscussionReplies: async (discussionId: number) => {
        const response = await api.get<Reply[]>(`/discussions/${discussionId}/replies/`);
        return response.data;
    },

    // Reply to discussion
    replyToDiscussion: async (discussionId: number, content: string) => {
        const response = await api.post<Reply>(`/discussions/${discussionId}/reply/`, {
            content,
        });
        return response.data;
    },
};

export const replyService = {
    // Get all replies
    getReplies: async (params?: { discussion?: number; user?: number }) => {
        const response = await api.get<Reply[]>('/replies/', { params });
        return response.data;
    },

    // Get reply by ID
    getReplyById: async (id: number) => {
        const response = await api.get<Reply>(`/replies/${id}/`);
        return response.data;
    },

    // Create reply
    createReply: async (replyData: Partial<Reply>) => {
        const response = await api.post<Reply>('/replies/', replyData);
        return response.data;
    },

    // Update reply
    updateReply: async (id: number, replyData: Partial<Reply>) => {
        const response = await api.put<Reply>(`/replies/${id}/`, replyData);
        return response.data;
    },

    // Delete reply
    deleteReply: async (id: number) => {
        await api.delete(`/replies/${id}/`);
    },
};

export default {
    discussion: discussionService,
    reply: replyService,
};
