import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';

export function AIChat() {
  const { messages, sessionId } = useInterviewStore();
  const { addMessage } = useInterviewStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId) return;

    const message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue,
      timestamp: Date.now(),
    };

    addMessage(message);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full glass rounded-xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="glass-dark border-b border-[#334155]/30 p-6">
        <div className="flex items-center gap-4 mb-1">
          <div className="text-3xl">🤖</div>
          <div>
            <h3 className="text-xl font-semibold text-[#E2E8F0]">AI Interviewer</h3>
            <p className="text-sm text-[#64748B] font-medium uppercase tracking-wider">Real-time feedback</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] glow-success animate-pulse"></span>
          <p className="text-xs text-[#10B981] font-semibold">Live</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center text-[#64748B]">
                <div className="text-4xl mb-3">👋</div>
                <p className="text-lg font-semibold mb-2 text-[#94A3B8]">Welcome to the Interview!</p>
                <p className="text-sm text-[#64748B] max-w-[220px]">Start coding and I'll provide real-time guidance and feedback...</p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl backdrop-blur-sm transition-all hover:shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#2E75B6] to-[#8B5CF6] text-white rounded-br-none shadow-lg shadow-[#8B5CF6]/20'
                      : 'glass-light text-[#E2E8F0] rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="text-base break-words leading-relaxed">{msg.content}</p>
                  <p className={`text-xs opacity-60 mt-2 font-light ${msg.role === 'user' ? 'text-white/70' : 'text-[#94A3B8]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="glass-light text-[#E2E8F0] px-4 py-3 rounded-2xl rounded-bl-none shadow-md">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2.5 h-2.5 bg-gradient-to-b from-[#2E75B6] to-[#8B5CF6] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    className="w-2.5 h-2.5 bg-gradient-to-b from-[#2E75B6] to-[#8B5CF6] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2.5 h-2.5 bg-gradient-to-b from-[#2E75B6] to-[#8B5CF6] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="glass-dark border-t border-[#334155]/30 p-4 backdrop-blur-xl"
      >
        <div className="flex gap-3">
          <div className="flex-1 glass-light rounded-2xl overflow-hidden">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              className="w-full px-5 py-4 bg-transparent text-[#E2E8F0] placeholder-[#64748B] focus:outline-none text-base font-medium"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2E75B6] to-[#8B5CF6] text-white font-semibold hover:shadow-lg hover:shadow-[#8B5CF6]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Send</span>
            <span className="text-base">→</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
