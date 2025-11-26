import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const interviewAPI = {
  start: (data: { level: string; domain: string }) =>
    api.post('/interview/start', data),

  runCode: (data: { session_id: string; code: string; language: string }) =>
    api.post('/code/run', data),

  submitCode: (data: { session_id: string; code: string }) =>
    api.post('/code/submit', data),

  getMetrics: (sessionId: string) =>
    api.get(`/metrics/${sessionId}`),

  getReport: (sessionId: string) =>
    api.get(`/report/${sessionId}`),

  logAntiCheatEvent: (data: { session_id: string; event_type: string; timestamp: number }) =>
    api.post('/anticheat/event', data),
};

export default api;
