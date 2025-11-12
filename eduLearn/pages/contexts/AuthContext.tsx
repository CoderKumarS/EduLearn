console.log('36. AuthContext - Starting imports');
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
console.log('37. AuthContext - About to import SecureStore');
import * as SecureStore from 'expo-secure-store';
console.log('38. AuthContext - SecureStore imported');
import { AuthState, AuthContextType, LoginCredentials, RegisterData, User } from '../types/auth';
import { authService } from '../services/authService';
import { handleApiError } from '../utils/errorHandler';
console.log('39. AuthContext - All imports done');

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
console.log('40. AuthContext - Context created');

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('41. AuthProvider - Component rendering');
  const [authState, dispatch] = useReducer(authReducer, initialState);
  console.log('42. AuthProvider - useReducer initialized');

  // Restore authentication state on app start
  useEffect(() => {
    console.log('43. AuthProvider - useEffect for restore starting');
    const restoreAuthState = async () => {
      try {
        console.log('44. AuthProvider - About to call SecureStore.getItemAsync for accessToken');
        const accessToken = await SecureStore.getItemAsync('accessToken');
        console.log('45. AuthProvider - accessToken retrieved:', accessToken ? 'exists' : 'null');

        console.log('46. AuthProvider - About to call SecureStore.getItemAsync for refreshToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        console.log('47. AuthProvider - refreshToken retrieved:', refreshToken ? 'exists' : 'null');

        console.log('48. AuthProvider - About to call SecureStore.getItemAsync for user');
        const userString = await SecureStore.getItemAsync('user');
        console.log('49. AuthProvider - user retrieved:', userString ? 'exists' : 'null');

        if (accessToken && refreshToken && userString) {
          console.log('50. AuthProvider - Parsing user data');
          const user = JSON.parse(userString);
          console.log('51. AuthProvider - Dispatching RESTORE_TOKEN');
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { user, accessToken, refreshToken },
          });
        } else {
          console.log('52. AuthProvider - No stored auth, setting loading false');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('53. AuthProvider - Error in restoreAuthState:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('54. AuthProvider - login called');
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login(credentials);
      console.log('55. AuthProvider - login response received');

      await SecureStore.setItemAsync('accessToken', response.access);
      await SecureStore.setItemAsync('refreshToken', response.refresh);

      if (response.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(response.user));
        console.log('56. AuthProvider - Tokens and user saved');

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
      console.error('57. AuthProvider - login error:', error);
      const apiError = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
    }
  };

  const register = async (userData: RegisterData) => {
    console.log('58. AuthProvider - register called');
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.register(userData);

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
      console.error('59. AuthProvider - register error:', error);
      const apiError = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
    }
  };

  const logout = async () => {
    console.log('60. AuthProvider - logout called');
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.warn('61. AuthProvider - logout error:', error);
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

  console.log('62. AuthProvider - Rendering children');
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

console.log('63. AuthContext - Module loaded');
