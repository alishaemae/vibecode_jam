import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  color: 'primary' | 'success' | 'warning' | 'error';
  icon: string;
}

function MetricCard({ title, value, unit, color, icon }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      const timer = setInterval(() => {
        setDisplayValue((prev) => {
          const increment = value > 100 ? 10 : 1;
          return prev + increment >= value ? value : prev + increment;
        });
      }, 10);
      return () => clearInterval(timer);
    }
  }, [value]);

  const colorMap = {
    primary: 'text-[#2E75B6]',
    success: 'text-[#10B981]',
    warning: 'text-[#F59E0B]',
    error: 'text-[#EF4444]',
  };

  const glowMap = {
    primary: 'shadow-lg shadow-[#2E75B6]/20 hover:shadow-[#2E75B6]/40',
    success: 'shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/40',
    warning: 'shadow-lg shadow-[#F59E0B]/20 hover:shadow-[#F59E0B]/40',
    error: 'shadow-lg shadow-[#EF4444]/20 hover:shadow-[#EF4444]/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -4 }}
      className={`glass-light rounded-xl p-5 transition-all cursor-default group ${glowMap[color]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] group-hover:text-[#94A3B8] transition-colors">{title}</p>
        <span className={`text-3xl transform group-hover:scale-110 transition-transform duration-200`}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>
        {typeof value === 'number' ? displayValue : value}
        {unit && <span className="text-xs ml-2 font-medium text-[#94A3B8]">{unit}</span>}
      </p>
    </motion.div>
  );
}

export function MetricsDashboard() {
  const { metrics, level } = useInterviewStore();
  const [timeElapsed, setTimeElapsed] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() % 3600000) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setTimeElapsed(
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const score = metrics?.score || 75;
  const scoreColor =
    score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent mb-2">
            Interview Progress
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-[#94A3B8]">Level:</p>
            <span className="px-3 py-1 rounded-full glass-light text-[#2E75B6] font-semibold text-sm">
              {level?.toUpperCase()} 🎯
            </span>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl"
        >
          🚀
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">Overall Progress</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm font-bold ${
              scoreColor === 'success'
                ? 'text-[#10B981]'
                : scoreColor === 'warning'
                ? 'text-[#F59E0B]'
                : 'text-[#EF4444]'
            }`}
          >
            {score}%
          </motion.p>
        </div>
        <div className="w-full bg-[#334155]/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', stiffness: 100 }}
            className={`h-full rounded-full transition-all ${
              scoreColor === 'success'
                ? 'bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857]'
                : scoreColor === 'warning'
                ? 'bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309]'
                : 'bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#B91C1C]'
            } shadow-lg`}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Tasks"
          value={`${metrics?.tasksCompleted || 0}/${metrics?.totalTasks || 3}`}
          color="primary"
          icon="📋"
        />
        <MetricCard
          title="Tests Passed"
          value={`${metrics?.testsPassed || 0}/${metrics?.totalTests || 5}`}
          color="success"
          icon="✅"
        />
        <MetricCard
          title="Time"
          value={timeElapsed}
          color="warning"
          icon="⏱️"
        />
        <MetricCard
          title="Score"
          value={score}
          unit="%"
          color={scoreColor}
          icon="⭐"
        />
      </div>
    </motion.div>
  );
}
