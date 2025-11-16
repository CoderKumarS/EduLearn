// User Profile and Settings Types

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    role: 'student' | 'instructor' | 'admin';
    joinedAt: string;
    lastActive?: string;
    preferences: UserPreferences;
    stats?: UserStats;
}

export interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications?: boolean;
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    accessibility?: {
        fontSize: 'small' | 'medium' | 'large';
        highContrast: boolean;
        screenReader: boolean;
    };
}

export interface UserStats {
    // Student statistics
    coursesEnrolled: number;
    coursesCompleted: number;
    totalLearningTime: number; // in minutes
    averageScore: number;
    streak: number; // consecutive days
    achievements: Achievement[];

    // Instructor statistics
    coursesCreated?: number;
    totalStudents?: number;
    totalEnrollments?: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    category: 'learning' | 'social' | 'milestone' | 'special';
}

export interface NotificationSettings {
    email: {
        courseUpdates: boolean;
        newMessages: boolean;
        achievements: boolean;
        weeklyDigest: boolean;
        marketing: boolean;
    };
    push: {
        courseReminders: boolean;
        newMessages: boolean;
        achievements: boolean;
        liveEvents: boolean;
    };
}

export interface SecuritySettings {
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
    loginHistory: LoginRecord[];
    trustedDevices: TrustedDevice[];
}

export interface LoginRecord {
    id: string;
    timestamp: string;
    ipAddress: string;
    device: string;
    location?: string;
    success: boolean;
}

export interface TrustedDevice {
    id: string;
    name: string;
    type: 'mobile' | 'desktop' | 'tablet';
    addedAt: string;
    lastUsed: string;
}
