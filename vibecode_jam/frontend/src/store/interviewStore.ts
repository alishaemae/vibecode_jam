import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  testCases: any[];
  examples: any[];
}

export interface Metrics {
  tasksCompleted: number;
  totalTasks: number;
  testsPassed: number;
  totalTests: number;
  score: number;
  timeElapsed: number;
  currentLevel: string;
}

interface InterviewState {
  sessionId: string | null;
  currentTask: Task | null;
  code: string;
  level: string;
  domain: string;
  messages: Message[];
  metrics: Metrics | null;
  isInterviewActive: boolean;
  testResults: any[] | null;

  setSessionId: (id: string) => void;
  setCurrentTask: (task: Task) => void;
  setCode: (code: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  updateMetrics: (metrics: Metrics) => void;
  startInterview: (level: string, domain: string) => void;
  endInterview: () => void;
  setTestResults: (results: any[]) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: null,
  currentTask: null,
  code: '',
  level: 'junior',
  domain: 'algorithms',
  messages: [],
  metrics: null,
  isInterviewActive: false,
  testResults: null,

  setSessionId: (id) => set({ sessionId: id }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setCode: (code) => set({ code }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  updateMetrics: (metrics) => set({ metrics }),
  startInterview: (level, domain) =>
    set({ level, domain, isInterviewActive: true, code: '' }),
  endInterview: () => set({ isInterviewActive: false }),
  setTestResults: (results) => set({ testResults: results }),
}));
