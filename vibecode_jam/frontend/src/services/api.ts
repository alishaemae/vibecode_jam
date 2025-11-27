import axios, { AxiosError } from 'axios';
import { config } from '../config/api';
import { handleApiError, logError } from '../utils/errorHandler';

const api = axios.create({
  baseURL: `${config.apiBaseUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorResponse = handleApiError(error);
    logError(error, 'API Request Failed', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });
    return Promise.reject(errorResponse);
  }
);

/**
 * Request interceptor for adding auth headers, etc.
 */
api.interceptors.request.use(
  (config) => {
    // Add any request headers here (e.g., Authorization token)
    return config;
  },
  (error) => {
    logError(error, 'API Request Setup Error');
    return Promise.reject(error);
  }
);

export const interviewAPI = {
  start: (data: { level: string; domain: string }) =>
    api.post('/interview/start', data),

  runCode: (data: { session_id: string; code: string; language: string }) =>
    api.post('/code/run', data),

  submitCode: (data: { session_id: string; code: string; language: string; task_id: number }) =>
    api.post('/code/submit', data),

  getMetrics: (sessionId: string) =>
    api.get(`/metrics/${sessionId}`),

  getReport: (sessionId: string) =>
    api.get(`/report/${sessionId}`),

  logAntiCheatEvent: (data: {
    session_id: string;
    event_type: string;
    timestamp: number;
  }) => api.post('/anticheat/event', data),
};

export default api;
