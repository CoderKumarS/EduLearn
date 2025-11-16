// Note: axios will be installed in task 2
// This file is prepared for when axios is available

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

// Type guard for axios-like errors
interface AxiosLikeError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
    message: string;
    isAxiosError?: boolean;
}

function isAxiosError(error: unknown): error is AxiosLikeError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        ('response' in error || 'isAxiosError' in error)
    );
}

export const handleApiError = (error: unknown): ApiError => {
    if (isAxiosError(error)) {
        // Check for network errors (no response from server)
        if (!error.response) {
            return {
                message: 'Cannot connect to server. Please check your internet connection or ensure the backend server is running.',
                code: 'NETWORK_ERROR',
            };
        }

        const status = error.response?.status;
        const responseData = error.response?.data as any;
        const message = responseData?.message || error.message;

        switch (status) {
            case 400:
                // For validation errors, try to extract detailed error messages
                let detailedMessage = 'Invalid request. Please check your input.';
                if (responseData) {
                    // Check for DRF validation errors (field-specific errors)
                    if (typeof responseData === 'object' && !responseData.message) {
                        const errors = Object.entries(responseData)
                            .map(([field, msgs]) => {
                                const messages = Array.isArray(msgs) ? msgs : [msgs];
                                return `${field}: ${messages.join(', ')}`;
                            })
                            .join('\n');
                        detailedMessage = errors || detailedMessage;
                    } else if (responseData.message) {
                        detailedMessage = responseData.message;
                    }
                }
                return {
                    message: detailedMessage,
                    status,
                    code: 'BAD_REQUEST',
                };
            case 401:
                return {
                    message: 'Authentication failed. Please check your credentials.',
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
    return isAxiosError(error) && !error.response;
};
