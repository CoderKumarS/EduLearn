/**
 * Authentication Context
 * Manages user authentication state with SecureStore persistence
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthState, AuthAction, User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { handleApiError } from '../utils/errorHandler';

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SecureStore keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true, // Start with true to check for stored tokens
    isAuthenticated: false,
    error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                isLoading: Boolean(true),
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                isLoading: Boolean(false),
                isAuthenticated: Boolean(true),
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                accessToken: null,
                refreshToken: null,
                isLoading: Boolean(false),
                isAuthenticated: Boolean(false),
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                accessToken: null,
                refreshToken: null,
                isLoading: Boolean(false),
                isAuthenticated: Boolean(false),
                error: null,
            };
        case 'RESTORE_TOKEN':
            return {
                ...state,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                isLoading: Boolean(false),
                isAuthenticated: Boolean(true),
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load tokens from SecureStore on mount
    useEffect(() => {
        loadTokens();
    }, []);

    const saveTokens = async (user: User, accessToken: string, refreshToken: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
            console.log('Tokens saved to SecureStore');
        } catch (error) {
            console.error('Error saving tokens to SecureStore:', error);
            throw error;
        }
    };

    const loadTokens = async (): Promise<void> => {
        try {
            const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            const userJson = await SecureStore.getItemAsync(USER_KEY);

            if (accessToken && refreshToken && userJson) {
                const user: User = JSON.parse(userJson);
                dispatch({
                    type: 'RESTORE_TOKEN',
                    payload: { user, accessToken, refreshToken },
                });
                console.log('Tokens restored from SecureStore');
            } else {
                // No stored tokens, set loading to false
                dispatch({ type: 'LOGIN_FAILURE', payload: '' });
            }
        } catch (error) {
            console.error('Error loading tokens from SecureStore:', error);
            dispatch({ type: 'LOGIN_FAILURE', payload: '' });
        }
    };

    const clearTokens = async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            console.log('Tokens cleared from SecureStore');
        } catch (error) {
            console.error('Error clearing tokens from SecureStore:', error);
        }
    };

    const login = async (username: string, password: string): Promise<void> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const credentials: LoginCredentials = { username, password };
            const response = await authService.login(credentials);

            // Extract tokens and user from response
            const accessToken = response.access;
            const refreshToken = response.refresh;
            const user = response.user || {
                id: '1',
                username: username,
                role: 'student' as const,
            };

            // Save tokens to SecureStore
            await saveTokens(user, accessToken, refreshToken);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user,
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            const apiError = handleApiError(error);
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: apiError.message || 'Login failed',
            });
            throw error;
        }
    };

    const register = async (userData: RegisterData): Promise<void> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await authService.register(userData);

            // Extract tokens and user from response
            const accessToken = response.access;
            const refreshToken = response.refresh;
            const user = response.user || {
                id: '1',
                username: userData.username,
                email: userData.email,
                role: userData.role || 'student' as const,
            };

            // Save tokens to SecureStore
            await saveTokens(user, accessToken, refreshToken);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user,
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            const apiError = handleApiError(error);
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: apiError.message || 'Registration failed',
            });
            throw error;
        }
    };

    const logout = async () => {
        await clearTokens();
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
