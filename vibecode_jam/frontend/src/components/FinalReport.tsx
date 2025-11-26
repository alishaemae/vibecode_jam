import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';

interface FinalReportProps {
  onRetry: () => void;
}

export function FinalReport({ onRetry }: FinalReportProps) {
  const { metrics } = useInterviewStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const score = metrics?.score || 85;
  const scoreColor =
    score >= 80 ? 'text-[#10B981]' : score >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Mock PDF generation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('PDF Report downloaded!');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1a1a2e] to-[#16213e] py-12 px-4 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#10B981]/20 to-transparent rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#8B5CF6]/20 to-transparent rounded-full blur-3xl opacity-30 -z-10"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
            className="text-6xl mb-6 inline-block"
          >
            🎉
          </motion.div>
          <h1 className="text-5xl font-semibold bg-gradient-to-r from-[#10B981] via-[#2E75B6] to-[#8B5CF6] bg-clip-text text-transparent mb-4">
            Interview Complete!
          </h1>
          <p className="text-[#94A3B8] text-xl font-light">Here's your detailed performance report</p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-10 mb-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-[#94A3B8] mb-6 text-sm font-semibold uppercase tracking-widest">Your Overall Score</p>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'} />
                      <stop offset="100%" stopColor={score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(51, 65, 85, 0.2)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    strokeWidth="8"
                    stroke="url(#scoreGradient)"
                    strokeDasharray="439.82"
                    strokeDashoffset={439.82 - (439.82 * score) / 100}
                    strokeLinecap="round"
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />
                </svg>
                <div className={`text-5xl font-semibold ${scoreColor} drop-shadow-lg`}>{score}%</div>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`text-2xl font-semibold ${scoreColor} mb-2`}
            >
              {score >= 80 ? '🏆 Excellent!' : score >= 50 ? '👍 Good!' : '💪 Keep Practicing!'}
            </motion.p>
            <p className="text-[#94A3B8] text-base">
              {score >= 80 ? 'Outstanding performance! You\'re ready for the next level.' : score >= 50 ? 'Great effort! Focus on the areas marked below to improve further.' : 'Great start! Review the feedback and keep practicing to improve your score.'}
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <motion.div
            variants={itemVariants}
            whileHover={{ translateY: -8 }}
            className="glass-light rounded-2xl p-8 text-center shadow-lg shadow-[#2E75B6]/20 hover:shadow-[#2E75B6]/40 transition-all"
          >
            <div className="text-3xl mb-4">📋</div>
            <p className="text-[#94A3B8] mb-3 text-base font-semibold uppercase tracking-wide">Tasks Completed</p>
            <p className="text-4xl font-semibold text-[#2E75B6]">
              {metrics?.tasksCompleted || 3}
            </p>
            <p className="text-sm text-[#64748B] mt-3 font-medium">
              out of {metrics?.totalTasks || 3} tasks
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ translateY: -8 }}
            className="glass-light rounded-2xl p-8 text-center shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/40 transition-all"
          >
            <div className="text-3xl mb-4">✅</div>
            <p className="text-[#94A3B8] mb-3 text-base font-semibold uppercase tracking-wide">Tests Passed</p>
            <p className="text-4xl font-semibold text-[#10B981]">
              {metrics?.testsPassed || 15}
            </p>
            <p className="text-sm text-[#64748B] mt-3 font-medium">
              out of {metrics?.totalTests || 20} tests
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ translateY: -8 }}
            className="glass-light rounded-2xl p-8 text-center shadow-lg shadow-[#8B5CF6]/20 hover:shadow-[#8B5CF6]/40 transition-all"
          >
            <div className="text-3xl mb-4">⏱️</div>
            <p className="text-[#94A3B8] mb-3 text-base font-semibold uppercase tracking-wide">Time Spent</p>
            <p className="text-4xl font-semibold text-[#8B5CF6]">45:32</p>
            <p className="text-sm text-[#64748B] mt-3 font-medium">minutes</p>
          </motion.div>
        </div>

        {/* Feedback Section */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-8 mb-10"
        >
          <h3 className="text-2xl font-bold text-[#E2E8F0] mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span> AI Feedback & Recommendations
          </h3>
          <div className="space-y-4">
            <motion.div
              whileHover={{ translateX: 4 }}
              className="glass-light rounded-xl p-5 border-l-4 border-[#10B981]"
            >
              <p className="text-[#10B981] font-bold mb-3 flex items-center gap-2 text-lg">
                <span>✨</span> Strengths
              </p>
              <ul className="space-y-2 text-[#E2E8F0] text-sm font-light">
                <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">✓</span> Strong understanding of data structures</li>
                <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">✓</span> Good code organization and naming conventions</li>
                <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">✓</span> Efficient algorithmic approach</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ translateX: 4 }}
              className="glass-light rounded-xl p-5 border-l-4 border-[#F59E0B]"
            >
              <p className="text-[#F59E0B] font-bold mb-3 flex items-center gap-2 text-lg">
                <span>💡</span> Areas for Improvement
              </p>
              <ul className="space-y-2 text-[#E2E8F0] text-sm font-light">
                <li className="flex items-start gap-2"><span className="text-[#F59E0B] mt-0.5">→</span> Add more comprehensive error handling</li>
                <li className="flex items-start gap-2"><span className="text-[#F59E0B] mt-0.5">→</span> Consider edge cases in your solutions</li>
                <li className="flex items-start gap-2"><span className="text-[#F59E0B] mt-0.5">→</span> Practice optimization techniques</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ translateX: 4 }}
              className="glass-light rounded-xl p-5 border-l-4 border-[#2E75B6]"
            >
              <p className="text-[#2E75B6] font-bold mb-3 flex items-center gap-2 text-lg">
                <span>🚀</span> Next Steps
              </p>
              <p className="text-[#E2E8F0] text-sm font-light leading-relaxed">
                Focus on solving more medium-level problems, especially those involving dynamic programming and tree traversal. Review your failed test cases and understand the edge cases better.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Detailed Breakdown */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-8 mb-10"
        >
          <h3 className="text-2xl font-bold text-[#E2E8F0] mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span> Task Breakdown
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((task, idx) => (
              <motion.div
                key={task}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.15 }}
                whileHover={{ translateX: 6, scale: 1.02 }}
                className="flex items-center justify-between p-4 glass-light rounded-xl border border-[#334155]/30 hover:border-[#334155]/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    idx === 0 || idx === 1
                      ? 'bg-gradient-to-br from-[#10B981] to-[#059669]'
                      : 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]'
                  }`}>
                    {task}
                  </div>
                  <div>
                    <p className="font-semibold text-[#E2E8F0]">Problem {task}</p>
                    <p className="text-xs text-[#94A3B8] font-light">
                      {[
                        'Array Sum',
                        'Linked List Reversal',
                        'Binary Tree Traversal',
                      ][idx]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      idx === 0 || idx === 1
                        ? 'text-[#10B981]'
                        : 'text-[#F59E0B]'
                    }`}
                  >
                    {idx === 0 || idx === 1 ? '5/5' : '3/5'} tests
                  </p>
                  <p className="text-xs text-[#94A3B8] font-medium">
                    {idx === 0 || idx === 1 ? '✓ 100%' : '⚠ 60%'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(148, 163, 184, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-8 py-4 rounded-xl glass-light text-[#E2E8F0] font-semibold hover:bg-[#475569]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="text-lg">📄</span>
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#2E75B6] via-[#6366F1] to-[#8B5CF6] text-white font-semibold hover:shadow-2xl transition-all flex items-center gap-2"
          >
            <span className="text-lg">🚀</span>
            Start New Interview
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
