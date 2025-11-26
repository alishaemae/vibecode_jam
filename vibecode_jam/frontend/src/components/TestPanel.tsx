import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';

export function TestPanel() {
  const { testResults } = useInterviewStore();
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');

  const mockTests = testResults || [
    {
      id: 1,
      name: 'Test Case 1',
      passed: true,
      input: '[1, 2, 3]',
      expected: '6',
      actual: '6',
      time: '0.5ms',
    },
    {
      id: 2,
      name: 'Test Case 2',
      passed: true,
      input: '[0]',
      expected: '0',
      actual: '0',
      time: '0.3ms',
    },
    {
      id: 3,
      name: 'Test Case 3',
      passed: false,
      input: '[-1, -2, -3]',
      expected: '-6',
      actual: '-5',
      time: '0.4ms',
    },
  ];

  const passedCount = mockTests.filter((t) => t.passed).length;
  const totalCount = mockTests.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full glass rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="glass-dark border-b border-[#334155]/30 p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#E2E8F0] flex items-center gap-2">
            <span className="text-xl">🧪</span> Test Results
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1 font-light">
            {passedCount}/{totalCount} tests passed
          </p>
        </div>
        <div className="flex gap-2 glass-light rounded-xl p-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'tests'
                ? 'bg-gradient-to-r from-[#2E75B6] to-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Tests
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('console')}
            className={`px-4 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'console'
                ? 'bg-gradient-to-r from-[#2E75B6] to-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Console
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-dark px-4 py-4 border-b border-[#334155]/30">
        <div className="mb-2 flex justify-between items-center">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Progress</p>
          <p className="text-xs font-bold text-[#10B981]">{Math.round((passedCount / totalCount) * 100)}%</p>
        </div>
        <div className="w-full bg-[#334155]/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(passedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 }}
            className="h-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] shadow-lg"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'tests' ? (
          <div className="space-y-2">
            <AnimatePresence>
              {mockTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    test.passed
                      ? 'glass-light border-[#10B981]/30 hover:border-[#10B981]/50'
                      : 'glass-light border-[#EF4444]/30 hover:border-[#EF4444]/50'
                  }`}
                >
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                    onClick={() =>
                      setExpandedTest(expandedTest === index ? null : index)
                    }
                    className="w-full p-3 flex items-center gap-3 transition-colors text-left"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        test.passed
                          ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white'
                          : 'bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white'
                      }`}
                    >
                      {test.passed ? '✓' : '✗'}
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#E2E8F0] text-sm">{test.name}</p>
                      <p className="text-xs text-[#64748B] font-light">{test.time}</p>
                    </div>
                    <motion.span
                      animate={{ rotate: expandedTest === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-[#94A3B8]"
                    >
                      ▼
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {expandedTest === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-[#334155]/30 bg-[#0F172A]/50 p-3 text-xs space-y-3"
                      >
                        <div className="space-y-1">
                          <p className="text-[#94A3B8] font-semibold uppercase text-xs tracking-wider">Input</p>
                          <p className="text-[#E2E8F0] font-mono text-xs bg-[#0F172A] rounded p-2">{test.input}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[#10B981] font-semibold uppercase text-xs tracking-wider">Expected</p>
                          <p className="text-[#10B981] font-mono text-xs bg-[#0F172A] rounded p-2">{test.expected}</p>
                        </div>
                        <div className="space-y-1">
                          <p className={`font-semibold uppercase text-xs tracking-wider ${
                            test.passed ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}>Actual</p>
                          <p
                            className={`font-mono text-xs bg-[#0F172A] rounded p-2 ${
                              test.passed ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {test.actual}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-light rounded-xl p-4 font-mono text-xs text-[#E2E8F0] space-y-1.5 leading-relaxed"
          >
            <p className="text-[#10B981]"><span className="font-bold">→</span> Running solution...</p>
            <p className="text-[#94A3B8]"><span className="text-[#10B981]">✓</span> Test 1 passed in <span className="font-bold">0.5ms</span></p>
            <p className="text-[#94A3B8]"><span className="text-[#10B981]">✓</span> Test 2 passed in <span className="font-bold">0.3ms</span></p>
            <p className="text-[#EF4444]"><span className="font-bold">✗</span> Test 3 failed: Expected -6, got -5</p>
            <p className="text-[#94A3B8] border-t border-[#334155]/30 pt-2 mt-2"><span className="font-bold">→</span> 2/3 tests passed</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
