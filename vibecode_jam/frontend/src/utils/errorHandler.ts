/**
 * Centralized error handling utilities
 * Provides consistent error logging and user-friendly messages
 */

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Standard application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Network/API error handler
 */
export const handleApiError = (error: any): ErrorResponse => {
  // Handle different error types
  if (error.response) {
    // HTTP error response
    const status = error.response.status;
    const data = error.response.data;

    const message = data?.message || data?.detail || getDefaultErrorMessage(status);
    const code = data?.code || `HTTP_${status}`;

    console.error(`API Error [${status}]:`, message, data);

    return {
      message,
      code,
      details: data,
    };
  } else if (error.request) {
    // Request made but no response
    console.error('No response received:', error.request);
    return {
      message: 'No response from server. Please check your connection.',
      code: 'NO_RESPONSE',
      details: error,
    };
  } else if (error instanceof Error) {
    // Error in request setup
    console.error('Request error:', error.message);
    return {
      message: error.message || 'An error occurred while processing your request',
      code: 'REQUEST_ERROR',
      details: error,
    };
  }

  console.error('Unknown error:', error);
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
};

/**
 * Get user-friendly error message based on HTTP status
 */
export const getDefaultErrorMessage = (statusCode: number): string => {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You are not authenticated. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'Conflict: This operation cannot be completed.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  };

  return messages[statusCode] || 'An error occurred. Please try again.';
};

/**
 * Validation error handler
 */
export const handleValidationError = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error.details && Array.isArray(error.details)) {
    // Pydantic validation errors
    error.details.forEach((err: any) => {
      const field = err.loc?.[1] || err.loc?.[0] || 'general';
      errors[field] = err.msg || 'Validation error';
    });
  } else if (error.errors && typeof error.errors === 'object') {
    // Other validation formats
    Object.entries(error.errors).forEach(([field, msg]: [string, any]) => {
      errors[field] = typeof msg === 'string' ? msg : 'Validation error';
    });
  }

  return errors;
};

/**
 * Safe async function wrapper with error handling
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorCallback?: (error: ErrorResponse) => void
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorCallback?.(errorResponse);
    return null;
  }
};

/**
 * Log error with context
 */
export const logError = (
  error: any,
  context: string,
  additionalInfo?: Record<string, any>
): void => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo,
  };

  console.error('[ERROR]', errorInfo);

  // In production, you might want to send errors to a monitoring service
  // e.g., Sentry, LogRocket, etc.
  if (import.meta.env.PROD && window.__sendErrorReport) {
    try {
      window.__sendErrorReport(errorInfo);
    } catch (e) {
      console.error('Failed to send error report:', e);
    }
  }
};

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

// Extend window interface for error reporting
declare global {
  interface Window {
    __sendErrorReport?: (errorInfo: Record<string, any>) => void;
  }
}
