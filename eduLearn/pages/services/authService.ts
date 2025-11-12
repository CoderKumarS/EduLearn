import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import config from '../constants/config';

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.apiAuthUrl;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/token/`, {
        username: credentials.username,
        password: credentials.password,
      });

      const { access, refresh } = response.data;

      // Get user profile after successful login
      const userResponse = await axios.get(`${config.apiBaseUrl}/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      return {
        access,
        refresh,
        user: userResponse.data,
      };
    } catch (error) {
      // If profile fetch fails, still return tokens but create user from token
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const response = await axios.post(`${this.baseURL}/token/`, {
          username: credentials.username,
          password: credentials.password,
        });

        const { access, refresh } = response.data;
        
        // Create a basic user object from the credentials
        const user: User = {
          id: '1', // This should ideally come from the token or a separate API call
          username: credentials.username,
          role: 'student', // Default role
        };

        return {
          access,
          refresh,
          user,
        };
      }
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
      const response = await axios.post(`${this.baseURL}/token/refresh/`, {
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

  async logout(): Promise<void> {
    // For JWT tokens, logout is typically handled client-side
    // by removing the tokens from storage
    // If your backend has a logout endpoint, you can call it here
    return Promise.resolve();
  }
}

export const authService = new AuthService();