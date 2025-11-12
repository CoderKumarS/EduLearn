import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        return {
          message: 'Invalid request. Please check your input.',
          status,
          code: 'BAD_REQUEST',
        };
      case 401:
        return {
          message: 'Authentication failed. Please login again.',
          status,
          code: 'UNAUTHORIZED',
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          status,
          code: 'FORBIDDEN',
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          status,
          code: 'NOT_FOUND',
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          status,
          code: 'SERVER_ERROR',
        };
      default:
        return {
          message: message || 'An unexpected error occurred.',
          status,
          code: 'UNKNOWN_ERROR',
        };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'CLIENT_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
  };
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && !error.response;
};