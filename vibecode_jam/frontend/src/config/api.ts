/**
 * API Configuration
 * Environment-based configuration for API endpoints
 */

// Determine API base URL dynamically
// If running in browser: use localhost:8000
// If running in development: use the current host
const getApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Use environment variable if set
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl !== 'http://backend:8000') {
      return envUrl;
    }

    // Use localhost for browser (cannot resolve 'backend' from browser)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '8000';

    // If running on localhost:5173, connect to localhost:8000
    // Otherwise use the current hostname with port 8000
    return `${protocol}//${hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname}:${port}`;
  }

  // Server-side fallback
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
const WS_BASE_URL = getApiBaseUrl();

export const config = {
  apiBaseUrl: API_BASE_URL,
  wsBaseUrl: WS_BASE_URL,

  endpoints: {
    interview: {
      start: '/api/interview/start',
      adaptTask: '/api/interview/adapt_task',
    },
    code: {
      submit: '/api/code/submit',
      run: '/api/code/run',
    },
    chat: {
      ws: (sessionId: string) => `/api/chat/ws/${sessionId}`,
    },
  },

  socketOptions: {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  },
};

/**
 * Get full WebSocket URL for a session
 */
export const getWebSocketUrl = (sessionId: string): string => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
  return `${protocol}://${wsHost}${config.endpoints.chat.ws(sessionId)}`;
};

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}${endpoint}`;
};
