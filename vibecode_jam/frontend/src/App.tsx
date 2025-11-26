import { useState, useEffect } from 'react';
import { useInterviewStore } from './store/interviewStore';
import { useCandidateStore } from './store/candidateStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useAntiCheat } from './hooks/useAntiCheat';
import { CandidateOnboarding } from './components/CandidateOnboarding';
import { InterviewSelector } from './components/InterviewSelector';
import { CodeEditor } from './components/CodeEditor';
import { AIChat } from './components/AIChat';
import { TestPanel } from './components/TestPanel';
import { MetricsDashboard } from './components/MetricsDashboard';
import { FinalReport } from './components/FinalReport';

type AppState = 'onboarding' | 'selector' | 'interview' | 'report';

function App() {
  console.log('App component loaded');
  const { isCompleted, resetProfile } = useCandidateStore();
  const [appState, setAppState] = useState<AppState>(isCompleted ? 'selector' : 'onboarding');
  const { sessionId, setSessionId, isInterviewActive } = useInterviewStore();
  console.log('App state:', appState);

  const { isConnected } = useWebSocket(sessionId);
  useAntiCheat(sessionId);

  // Reset profile with Ctrl+Shift+R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
        e.preventDefault();
        resetProfile();
        setAppState('onboarding');
        console.log('✅ Profile reset! Showing onboarding...');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetProfile]);

  const handleStartInterview = (newSessionId: string) => {
    setSessionId(newSessionId);
    setAppState('interview');
  };

  const handleRetry = () => {
    setAppState('selector');
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0F172A] via-[#1a1a2e] to-[#16213e] text-[#F8FAFC] overflow-hidden relative">
      {/* Dev Reset Button */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            resetProfile();
            setAppState('onboarding');
          }}
          className="fixed bottom-4 left-4 px-4 py-2 rounded-lg text-sm bg-red-600/80 hover:bg-red-600 text-white font-semibold z-50 opacity-60 hover:opacity-100 transition-opacity"
          title="Reset profile (Ctrl+Shift+R)"
        >
          🔄 Reset
        </button>
      )}

      {appState === 'onboarding' ? (
        <CandidateOnboarding onComplete={() => setAppState('selector')} />
      ) : appState === 'selector' ? (
        <InterviewSelector onStart={handleStartInterview} />
      ) : appState === 'interview' ? (
        <div className="h-full flex flex-col">
          {/* Top metrics bar */}
          <div className="p-4 glass-dark border-b border-[#334155]/30">
            <MetricsDashboard />
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex gap-4 p-4">
            {/* Code editor and tests (70%) */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex-1 min-h-0">
                <CodeEditor />
              </div>
              <div className="h-48">
                <TestPanel />
              </div>
            </div>

            {/* AI Chat (30%) */}
            <div className="w-96">
              <AIChat />
            </div>
          </div>

          {/* Status bar */}
          <div className="glass-dark border-t border-[#334155]/30 px-5 py-4 text-base text-[#94A3B8]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#10B981] glow-success' : 'bg-[#EF4444]'}`}></span>
                <span>{isConnected ? 'Connected to AI' : 'Disconnected'}</span>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => setAppState('report')}
                  className="px-5 py-2.5 rounded-xl glass-light hover:bg-[#475569]/50 transition-all hover:glow-primary text-[#E2E8F0] font-medium"
                >
                  View Report
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <FinalReport onRetry={handleRetry} />
      )}
    </div>
  );
}

export default App;
