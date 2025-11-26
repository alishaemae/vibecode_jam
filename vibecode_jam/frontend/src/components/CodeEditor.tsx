import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';
import { interviewAPI } from '../services/api';

interface CodeEditorProps {
  onRunTests?: () => void;
  onSubmit?: () => void;
}

export function CodeEditor({ onRunTests, onSubmit }: CodeEditorProps) {
  const { code, setCode, currentTask, sessionId } = useInterviewStore();
  const [language, setLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    if (!sessionId) return;

    setIsRunning(true);
    try {
      const response = await interviewAPI.runCode({
        session_id: sessionId,
        code,
        language,
      });
      onRunTests?.();
      console.log('Test results:', response.data);
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    try {
      await interviewAPI.submitCode({
        session_id: sessionId,
        code,
      });
      onSubmit?.();
    } catch (error) {
      console.error('Failed to submit code:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full glass rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="glass-dark border-b border-[#334155]/30 p-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-[#E2E8F0] flex items-center gap-3">
            <span className="text-2xl">💻</span> Code Editor
          </h3>
          {currentTask && (
            <p className="text-sm text-[#94A3B8] mt-2 font-light">{currentTask.title}</p>
          )}
        </div>
        <div className="glass-light rounded-xl overflow-hidden">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-5 py-3 bg-transparent text-[#E2E8F0] text-base focus:outline-none font-semibold cursor-pointer appearance-none"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"JetBrains Mono"',
            lineHeight: 1.6,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            smoothScrolling: true,
            bracketPairColorization: {
              enabled: true,
            },
          }}
        />
      </div>

      {/* Footer with Buttons */}
      <div className="glass-dark border-t border-[#334155]/30 p-5 flex gap-4 justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-6 py-3 rounded-xl glass-light text-[#E2E8F0] font-semibold hover:bg-[#475569]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-base"
        >
          <span className="text-lg">⚙️</span>
          {isRunning ? (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              Running...
            </motion.span>
          ) : (
            'Run Tests'
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2E75B6] to-[#8B5CF6] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-base"
        >
          <span className="text-lg">✅</span>
          Submit Solution
        </motion.button>
      </div>
    </motion.div>
  );
}
