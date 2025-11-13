import api from './api';
import { AdminStats, SystemAlert, RecentUser, ContentModerationItem, AdminAction } from '../types/admin';

class AdminService {
    // Dashboard Statistics
    async getAdminStats(): Promise<AdminStats> {
        try {
            const response = await api.get('/admin/stats/');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            // Return mock data as fallback
            return {
                totalUsers: 12450,
                activeCourses: 2130,
                pendingReviews: 185,
                totalRevenue: 125000,
                activeStudents: 8500,
                completionRate: 72,
            };
        }
    }

    // System Alerts
    async getSystemAlerts(): Promise<SystemAlert[]> {
        try {
            const response = await api.get('/admin/alerts/');
            return response.data;
        } catch (error) {
            console.error('Error fetching system alerts:', error);
            // Return mock data as fallback
            return [
                {
                    id: '1',
                    type: 'error',
                    title: 'Critical system update available',
                    message: 'Restart required.',
                    timestamp: new Date().toISOString(),
                    isResolved: false,
                    priority: 'critical',
                    actionRequired: true,
                },
                {
                    id: '2',
                    type: 'warning',
                    title: 'New instructor registration pending approval',
                    message: '',
                    timestamp: new Date().toISOString(),
                    isResolved: false,
                    priority: 'high',
                    actionRequired: true,
                },
            ];
        }
    }

    async resolveAlert(alertId: string): Promise<void> {
        await api.patch(`/admin/alerts/${alertId}/`, { isResolved: true });
    }

    // Recent Users
    async getRecentUsers(limit: number = 10): Promise<RecentUser[]> {
        try {
            const response = await api.get(`/admin/users/recent/?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent users:', error);
            // Return mock data as fallback
            return [
                {
                    id: '1',
                    username: 'Arjun Smith',
                    email: 'arjun@example.com',
                    role: 'student',
                    avatar: '',
                    joinedAt: new Date().toISOString(),
                    status: 'active',
                },
                {
                    id: '2',
                    username: 'Rishi Johnson',
                    email: 'rishi@example.com',
                    role: 'instructor',
                    avatar: '',
                    joinedAt: new Date().toISOString(),
                    status: 'active',
                },
            ];
        }
    }

    async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: RecentUser[]; total: number }> {
        const response = await api.get(`/admin/users/?page=${page}&limit=${limit}`);
        return response.data;
    }

    // Content Moderation
    async getContentForModeration(status?: 'pending' | 'approved' | 'rejected'): Promise<ContentModerationItem[]> {
        try {
            const params = status ? `?status=${status}` : '';
            const response = await api.get(`/admin/moderation/${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching content for moderation:', error);
            return [];
        }
    }

    async moderateContent(itemId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
        await api.post(`/admin/moderation/${itemId}/`, {
            action,
            reason,
        });
    }

    // Admin Actions
    async logAdminAction(action: Omit<AdminAction, 'id' | 'timestamp'>): Promise<AdminAction> {
        const response = await api.post('/admin/actions/', action);
        return response.data;
    }

    async getAdminActions(page: number = 1, limit: number = 20): Promise<{ actions: AdminAction[]; total: number }> {
        const response = await api.get(`/admin/actions/?page=${page}&limit=${limit}`);
        return response.data;
    }

    // User Management
    async suspendUser(userId: string, reason: string): Promise<void> {
        await api.post(`/admin/users/${userId}/suspend/`, { reason });
    }

    async activateUser(userId: string): Promise<void> {
        await api.post(`/admin/users/${userId}/activate/`);
    }

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/admin/users/${userId}/`);
    }
}

export const adminService = new AdminService();
