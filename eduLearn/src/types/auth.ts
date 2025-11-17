/**
 * Authentication Types and Interfaces
 * Defines types for user authentication and authorization
 */

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
    id: string | number;
    username: string;
    email?: string;
    name?: string;
    role: UserRole;
    profile_image?: string;
    bio?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: 'student' | 'instructor';
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user?: User;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

export interface AuthContextType {
    authState: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'RESTORE_TOKEN'; payload: { user: User; accessToken: string; refreshToken: string } }
    | { type: 'CLEAR_ERROR' };
