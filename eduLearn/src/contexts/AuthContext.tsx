import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthState, AuthContextType, LoginCredentials, RegisterData, User } from '../types/auth';
import { authService } from '../services/authService';
import { handleApiError } from '../utils/errorHandler';

// Auth reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Restore authentication state on app start
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const userString = await SecureStore.getItemAsync('user');

        if (accessToken && refreshToken && userString) {
          const user = JSON.parse(userString);
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { user, accessToken, refreshToken },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.warn('Failed to restore auth state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login(credentials);
      
      // Store tokens and user data securely
      await SecureStore.setItemAsync('accessToken', response.access);
      await SecureStore.setItemAsync('refreshToken', response.refresh);
      
      if (response.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(response.user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
          },
        });
      } else {
        throw new Error('User data not received from server');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.register(userData);
      
      // Store tokens and user data securely
      await SecureStore.setItemAsync('accessToken', response.access);
      await SecureStore.setItemAsync('refreshToken', response.refresh);
      
      if (response.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(response.user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
          },
        });
      } else {
        throw new Error('User data not received from server');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
    }
  };

  const logout = async () => {
    try {
      // Clear stored tokens
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    authState,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};