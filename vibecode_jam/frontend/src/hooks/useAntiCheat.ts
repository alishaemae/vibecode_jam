import { useEffect, useRef, useCallback } from 'react';
import { interviewAPI } from '../services/api';

interface AntiCheatEvent {
  event_type: string;
  timestamp: number;
}

const BATCH_INTERVAL = 5000; // Batch events every 5 seconds
const DEVTOOLS_CHECK_INTERVAL = 2000; // Check devtools every 2 seconds (increased from 1s for better performance)

export function useAntiCheat(sessionId: string | null) {
  const eventQueueRef = useRef<AntiCheatEvent[]>([]);

  /**
   * Queue an event for batch sending
   */
  const queueEvent = useCallback((eventType: string) => {
    eventQueueRef.current.push({
      event_type: eventType,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Send batched events to the server
   */
  const flushEvents = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const events = eventQueueRef.current.splice(0);
    try {
      // Send all batched events in a single request
      for (const event of events) {
        await interviewAPI.logAntiCheatEvent({
          session_id: sessionId,
          ...event,
        });
      }
    } catch (error) {
      // Log error but don't fail - re-queue events if needed
      console.error('Failed to log anti-cheat events:', error);
      // Re-add events to queue for retry
      eventQueueRef.current.push(...events);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    /**
     * Handle paste event
     */
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      queueEvent('paste_detected');
    };

    /**
     * Handle copy event
     */
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      queueEvent('copy_detected');
    };

    /**
     * Detect if DevTools is open
     */
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold) {
        queueEvent('devtools_open');
      }
    };

    /**
     * Handle tab visibility change
     */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        queueEvent('tab_switch');
      }
    };

    // Register event listeners
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up intervals
    const devtoolsInterval = setInterval(detectDevTools, DEVTOOLS_CHECK_INTERVAL);
    const batchInterval = setInterval(flushEvents, BATCH_INTERVAL);

    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(devtoolsInterval);
      clearInterval(batchInterval);
      // Flush remaining events before unmounting
      flushEvents();
    };
  }, [sessionId, queueEvent, flushEvents]);
}
