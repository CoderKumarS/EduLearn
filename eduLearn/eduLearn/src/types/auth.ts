/**
 * Authentication Types and Interfaces
 * Defines types for user authentication and authorization
 */

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

export type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'RESTORE_TOKEN'; payload: { user: User; accessToken: string; refreshToken: string } }
    | { type: 'CLEAR_ERROR' };
