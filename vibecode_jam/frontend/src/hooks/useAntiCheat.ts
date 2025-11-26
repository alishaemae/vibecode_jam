import { useEffect } from 'react';
import { interviewAPI } from '../services/api';

export function useAntiCheat(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      interviewAPI.logAntiCheatEvent({
        session_id: sessionId,
        event_type: 'paste_detected',
        timestamp: Date.now(),
      }).catch(console.error);
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      interviewAPI.logAntiCheatEvent({
        session_id: sessionId,
        event_type: 'copy_detected',
        timestamp: Date.now(),
      }).catch(console.error);
    };

    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold) {
        interviewAPI.logAntiCheatEvent({
          session_id: sessionId,
          event_type: 'devtools_open',
          timestamp: Date.now(),
        }).catch(console.error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        interviewAPI.logAntiCheatEvent({
          session_id: sessionId,
          event_type: 'tab_switch',
          timestamp: Date.now(),
        }).catch(console.error);
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [sessionId]);
}
