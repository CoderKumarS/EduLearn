import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import config from '../constants/config';

class AuthService {
    private baseURL: string;

    constructor() {
        this.baseURL = config.apiAuthUrl;
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        console.log('=== Login Attempt ===');
        console.log('Auth URL:', this.baseURL);
        console.log('Full endpoint:', `${this.baseURL}/login/`);
        console.log('Username:', credentials.username);

        try {
            // Step 1: Get authentication tokens
            const response = await axios.post(`${this.baseURL}/login/`, {
                username: credentials.username,
                password: credentials.password,
            });

            console.log('✅ Login successful! Tokens received.');
            const { access, refresh, user: userData } = response.data;

            // Step 2: Use user data from response (includes role)
            let user: User;
            if (userData) {
                // Backend now returns user data with role and profile image
                user = {
                    id: userData.id?.toString() || '1',
                    username: userData.username,
                    email: userData.email,
                    role: userData.role || 'student',
                    name: userData.first_name && userData.last_name
                        ? `${userData.first_name} ${userData.last_name}`.trim()
                        : undefined,
                    profile_image: userData.profile_image,
                    bio: userData.bio,
                };
            } else {
                // Fallback: Extract from JWT token
                try {
                    const payload = access.split('.')[1];
                    const decodedPayload = JSON.parse(atob(payload));

                    user = {
                        id: decodedPayload.user_id?.toString() || '1',
                        username: credentials.username,
                        role: decodedPayload.role || 'student',
                        email: decodedPayload.email,
                    };
                    console.log('✅ User data extracted from token');
                } catch (decodeError) {
                    // Final fallback
                    user = {
                        id: '1',
                        username: credentials.username,
                        role: 'student',
                    };
                    console.log('✅ Using fallback user data');
                }
            }

            return {
                access,
                refresh,
                user,
            };
        } catch (error) {
            console.error('=== Login Error ===');
            console.error('Error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
                console.error('Request URL:', error.config?.url);
                console.error('Has response:', !!error.response);
            }
            console.error('==================');
            throw error;
        }
    }

    async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${this.baseURL}/register/`, {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'student',
            });

            // After successful registration, login to get tokens
            return await this.login({
                username: userData.username,
                password: userData.password,
            });
        } catch (error) {
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${this.baseURL}/refresh/`, {
                refresh: refreshToken,
            });

            return {
                access: response.data.access,
                refresh: refreshToken, // Keep the same refresh token
            };
        } catch (error) {
            throw error;
        }
    }

    async logout(refreshToken?: string): Promise<void> {
        try {
            // Call backend logout endpoint to blacklist the token
            if (refreshToken) {
                await axios.post(`${this.baseURL}/logout/`, {
                    refresh_token: refreshToken,
                });
            }
        } catch (error) {
            // Ignore logout errors - token will be removed from client anyway
            console.log('Logout error (ignored):', error);
        }
        return Promise.resolve();
    }

    async getCurrentUser(accessToken: string): Promise<User> {
        try {
            const response = await axios.get(`${this.baseURL}/profile/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userData = response.data;
            const user: User = {
                id: userData.id?.toString() || '1',
                username: userData.username,
                email: userData.email,
                role: userData.role || 'student',
                name: userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`.trim()
                    : undefined,
                profile_image: userData.profile_image,
                bio: userData.bio,
            };
            return user;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();
