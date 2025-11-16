import api from './api';
import { Notification } from '../types/course';

export const notificationService = {
    // Get all notifications
    getNotifications: async (params?: {
        is_read?: boolean;
        notification_type?: string;
    }) => {
        const response = await api.get<Notification[]>('/notifications/', { params });
        return response.data;
    },

    // Get notification by ID
    getNotificationById: async (id: number) => {
        const response = await api.get<Notification>(`/notifications/${id}/`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id: number) => {
        const response = await api.put<Notification>(`/notifications/${id}/`, {
            is_read: true,
        });
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id: number) => {
        await api.delete(`/notifications/${id}/`);
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get<{ unread_count: number }>('/notifications/unread/');
        return response.data.unread_count;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await api.post<{ message: string }>('/notifications/mark_all_read/');
        return response.data;
    },
};

export default notificationService;
