import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore } from '../store/interviewStore';
import { config, getWebSocketUrl } from '../config/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export function useWebSocket(sessionId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage } = useInterviewStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = getWebSocketUrl(sessionId);
    const newSocket = io(wsUrl, {
      ...config.socketOptions,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('ai_message', (data: { content: string }) => {
      const message: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: data.content,
        timestamp: Date.now(),
      };
      addMessage(message);
    });

    newSocket.on('task_updated', (data: any) => {
      // Handle task update
      console.log('Task updated:', data);
    });

    newSocket.on('metrics_updated', (data: any) => {
      // Handle metrics update
      console.log('Metrics updated:', data);
    });

    newSocket.on('error', (error: string) => {
      setError(error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, addMessage]);

  const sendMessage = useCallback((content: string) => {
    if (socket && isConnected) {
      socket.emit('user_message', { content });
      const message: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      addMessage(message);
    }
  }, [socket, isConnected, addMessage]);

  return { isConnected, sendMessage, error };
}
