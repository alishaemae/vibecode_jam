import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';
import { interviewAPI } from '../services/api';
import { VibeLogo } from './VibeLogo';

const LEVELS = [
  { name: 'Junior', icon: '🌱', color: 'from-green-400 to-emerald-600', description: 'Basics' },
  { name: 'Middle', icon: '⚡', color: 'from-yellow-400 to-orange-600', description: 'Intermediate' },
  { name: 'Senior', icon: '🚀', color: 'from-purple-400 to-pink-600', description: 'Advanced' },
];

const DOMAINS = [
  { id: 'algorithms', name: 'Algorithms', icon: '⚙️', color: 'from-blue-400 to-cyan-600' },
  { id: 'backend', name: 'Backend', icon: '🏗️', color: 'from-orange-400 to-red-600' },
  { id: 'frontend', name: 'Frontend', icon: '🎨', color: 'from-pink-400 to-rose-600' },
];

interface InterviewSelectorProps {
  onStart: (sessionId: string) => void;
}

export function InterviewSelector({ onStart }: InterviewSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('Junior');
  const [selectedDomain, setSelectedDomain] = useState<string>('algorithms');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startInterview } = useInterviewStore();

  const handleStart = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await interviewAPI.start({
        level: selectedLevel.toLowerCase(),
        domain: selectedDomain,
      });
      const sessionId = response.data.session_id;
      startInterview(selectedLevel.toLowerCase(), selectedDomain);
      onStart(sessionId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to start interview';
      setError(errorMessage);
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLevelData = LEVELS.find(l => l.name === selectedLevel);
  const selectedDomainData = DOMAINS.find(d => d.id === selectedDomain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl opacity-40 -z-10"
      />
      <motion.div
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, delay: 2 }}
        className="absolute bottom-32 left-10 w-80 h-80 bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl opacity-40 -z-10"
      />

      {/* Main Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-[680px] relative z-10"
      >
        {/* Outer glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-purple-500/30 rounded-3xl blur-2xl"
        />

        {/* Main card with advanced glassmorphism */}
        <div className="relative backdrop-blur-2xl bg-[rgba(15,23,42,0.75)] border border-[rgba(100,116,139,0.2)] rounded-3xl p-10 shadow-2xl shadow-purple-900/30">
          {/* Subtle inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <VibeLogo />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center text-[#94A3B8] text-base font-light tracking-wide mb-10"
            >
              Master coding interviews with AI guidance
            </motion.p>

            {/* Level Selection */}
            <div className="mb-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-xl font-semibold mb-6 text-[#E2E8F0] flex items-center gap-3"
              >
                <span className="text-2xl">🎯</span> Select Your Level
              </motion.h2>
              <div className="grid grid-cols-3 gap-4">
                {LEVELS.map((level, index) => (
                  <motion.button
                    key={level.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    onClick={() => setSelectedLevel(level.name)}
                    whileHover={{ scale: 1.08, translateY: -4 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative group overflow-hidden rounded-2xl transition-all ${
                      selectedLevel === level.name
                        ? `bg-gradient-to-br ${level.color} text-white shadow-lg shadow-purple-500/40`
                        : 'bg-[rgba(51,65,85,0.3)] text-[#94A3B8] hover:bg-[rgba(71,85,105,0.4)]'
                    }`}
                  >
                    {/* Particle effect when selected */}
                    <AnimatePresence>
                      {selectedLevel === level.name && (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none"
                              initial={{
                                x: '50%',
                                y: '50%',
                                opacity: 1,
                              }}
                              animate={{
                                x: (Math.random() - 0.5) * 200,
                                y: (Math.random() - 0.5) * 200,
                                opacity: 0,
                              }}
                              transition={{
                                duration: 1 + Math.random() * 0.5,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>

                    {/* Button content */}
                    <div className="relative z-10 p-6 text-center">
                      <motion.div
                        className="text-4xl mb-3"
                        animate={
                          selectedLevel === level.name
                            ? { y: [0, -6, 0] }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {level.icon}
                      </motion.div>
                      <div className="text-base font-semibold">{level.name}</div>
                      <div className="text-sm opacity-75 mt-1 font-light">
                        {level.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Domain Selection */}
            <div className="mb-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-xl font-semibold mb-6 text-[#E2E8F0] flex items-center gap-3"
              >
                <span className="text-2xl">🎓</span> Choose Domain
              </motion.h2>
              <div className="grid grid-cols-3 gap-4">
                {DOMAINS.map((domain) => (
                  <motion.button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative group rounded-xl p-5 transition-all overflow-hidden ${
                      selectedDomain === domain.id
                        ? `bg-gradient-to-br ${domain.color} text-white shadow-lg`
                        : 'bg-[rgba(51,65,85,0.3)] text-[#94A3B8] hover:bg-[rgba(71,85,105,0.4)]'
                    }`}
                  >
                    <div className="relative z-10 text-center">
                      <div className="text-3xl mb-3">{domain.icon}</div>
                      <div className="text-base font-semibold">{domain.name}</div>
                    </div>
                    {selectedDomain === domain.id && (
                      <motion.div
                        layoutId="domainUnderline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Start Button with shimmer effect */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              onClick={handleStart}
              disabled={isLoading}
              className="relative w-full py-5 px-8 rounded-2xl overflow-hidden group font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-100 group-hover:opacity-90 transition-opacity" />

              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: ['100%', '-100%'] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center gap-2 text-white">
                {isLoading ? (
                  <>
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </motion.svg>
                    <span>Starting JAM Session...</span>
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      🚀
                    </motion.span>
                    <span>Start Interview</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Footer message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-center text-[#64748B] text-sm mt-10 font-light"
            >
              ✨ Real-time AI feedback • 🧪 Instant test execution • 📈 Performance tracking
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
