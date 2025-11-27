/**
 * API Configuration
 * Environment-based configuration for API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8000';

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
