import api from './api';
import { UserProfile, UserPreferences, NotificationSettings, SecuritySettings } from '../types/profile';

class ProfileService {
    // Profile Management
    async getUserProfile(userId: string): Promise<UserProfile> {
        try {
            const response = await api.get(`/users/${userId}/profile/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
        const response = await api.patch(`/users/${userId}/profile/`, profileData);
        return response.data;
    }

    async uploadProfilePhoto(userId: string, photoUri: string): Promise<{ avatar: string }> {
        const formData = new FormData();
        formData.append('avatar', {
            uri: photoUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        } as any);

        const response = await api.post(`/users/${userId}/profile/photo/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async deleteProfilePhoto(userId: string): Promise<void> {
        await api.delete(`/users/${userId}/profile/photo/`);
    }

    // Preferences
    async getUserPreferences(userId: string): Promise<UserPreferences> {
        try {
            const response = await api.get(`/users/${userId}/preferences/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            // Return default preferences
            return {
                emailNotifications: true,
                pushNotifications: true,
                language: 'en',
                timezone: 'UTC',
                theme: 'system',
            };
        }
    }

    async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
        const response = await api.patch(`/users/${userId}/preferences/`, preferences);
        return response.data;
    }

    // Notification Settings
    async getNotificationSettings(userId: string): Promise<NotificationSettings> {
        try {
            const response = await api.get(`/users/${userId}/notifications/settings/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            // Return default settings
            return {
                email: {
                    courseUpdates: true,
                    newMessages: true,
                    achievements: true,
                    weeklyDigest: true,
                    marketing: false,
                },
                push: {
                    courseReminders: true,
                    newMessages: true,
                    achievements: true,
                    liveEvents: true,
                },
            };
        }
    }

    async updateNotificationSettings(
        userId: string,
        settings: Partial<NotificationSettings>
    ): Promise<NotificationSettings> {
        const response = await api.patch(`/users/${userId}/notifications/settings/`, settings);
        return response.data;
    }

    // Security
    async getSecuritySettings(userId: string): Promise<SecuritySettings> {
        try {
            const response = await api.get(`/users/${userId}/security/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching security settings:', error);
            return {
                twoFactorEnabled: false,
                loginHistory: [],
                trustedDevices: [],
            };
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        await api.post(`/users/${userId}/security/change-password/`, {
            currentPassword,
            newPassword,
        });
    }

    async enableTwoFactor(userId: string): Promise<{ qrCode: string; secret: string }> {
        const response = await api.post(`/users/${userId}/security/2fa/enable/`);
        return response.data;
    }

    async disableTwoFactor(userId: string, code: string): Promise<void> {
        await api.post(`/users/${userId}/security/2fa/disable/`, { code });
    }

    async verifyTwoFactor(userId: string, code: string): Promise<boolean> {
        try {
            const response = await api.post(`/users/${userId}/security/2fa/verify/`, { code });
            return response.data.verified;
        } catch (error) {
            return false;
        }
    }

    // Account Management
    async deleteAccount(userId: string, password: string, reason?: string): Promise<void> {
        await api.post(`/users/${userId}/delete/`, {
            password,
            reason,
        });
    }

    async deactivateAccount(userId: string): Promise<void> {
        await api.post(`/users/${userId}/deactivate/`);
    }

    async reactivateAccount(userId: string): Promise<void> {
        await api.post(`/users/${userId}/reactivate/`);
    }

    // User Stats
    async getUserStats(userId: string) {
        try {
            const response = await api.get(`/users/${userId}/stats/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return {
                coursesEnrolled: 0,
                coursesCompleted: 0,
                totalLearningTime: 0,
                averageScore: 0,
                streak: 0,
                achievements: [],
            };
        }
    }

    // Achievements
    async getUserAchievements(userId: string) {
        try {
            const response = await api.get(`/users/${userId}/achievements/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user achievements:', error);
            return [];
        }
    }
}

export const profileService = new ProfileService();
