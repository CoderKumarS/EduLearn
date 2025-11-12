// Admin Dashboard Types

export interface AdminStats {
    totalUsers: number;
    activeCourses: number;
    pendingReviews: number;
    totalRevenue?: number;
    activeStudents?: number;
    completionRate?: number;
}

export interface SystemAlert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    isResolved: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionRequired?: boolean;
}

export interface RecentUser {
    id: string;
    username: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    avatar?: string;
    joinedAt: string;
    status: 'active' | 'inactive' | 'suspended';
    lastActive?: string;
}

export interface ContentModerationItem {
    id: string;
    type: 'course' | 'comment' | 'review' | 'message';
    title: string;
    content: string;
    author: {
        id: string;
        username: string;
        avatar?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    reportedBy?: string[];
    reportReason?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

export interface AdminAction {
    id: string;
    type: 'approve' | 'reject' | 'suspend' | 'delete' | 'warn';
    targetType: 'user' | 'course' | 'content';
    targetId: string;
    performedBy: string;
    reason?: string;
    timestamp: string;
}
