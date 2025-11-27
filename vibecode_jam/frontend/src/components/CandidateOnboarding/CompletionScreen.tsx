import { motion } from 'framer-motion';
import { useCandidateStore } from '../../store/candidateStore';

interface CompletionScreenProps {
  onContinue: () => void;
}

export function CompletionScreen({ onContinue }: CompletionScreenProps) {
  const { profile } = useCandidateStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Animated celebration elements */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <motion.div
          className="text-8xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎉
        </motion.div>
      </motion.div>

      {/* Main success message */}
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
        >
          Добро пожаловать! 🚀
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-[#94A3B8] text-lg max-w-md mx-auto"
        >
          Ваш профиль завершен и готов к собеседованию
        </motion.p>
      </motion.div>

      {/* Profile summary card */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-[rgba(6,182,212,0.1)] to-[rgba(168,85,247,0.1)] border border-cyan-500/30"
      >
        <div className="space-y-4">
          {/* Name and role */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#475569]/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#E2E8F0]">{profile.fullName}</h3>
              <p className="text-sm text-[#94A3B8]">
                {profile.currentRole} at {profile.currentCompany}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              variants={itemVariants}
              className="text-center p-3 rounded-lg bg-[rgba(51,65,85,0.2)] border border-[#475569]/30"
            >
              <div className="text-3xl font-semibold text-cyan-400">{profile.yearsOfExperience}</div>
              <div className="text-sm text-[#94A3B8] mt-1">Лет опыта</div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center p-3 rounded-lg bg-[rgba(51,65,85,0.2)] border border-[#475569]/30"
            >
              <div className="text-3xl font-semibold text-purple-400">
                {(profile.technologyPreferences || []).length}
              </div>
              <div className="text-sm text-[#94A3B8] mt-1">Технологии</div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center p-3 rounded-lg bg-[rgba(51,65,85,0.2)] border border-[#475569]/30"
            >
              <div className="text-3xl font-semibold text-pink-400">
                {profile.linkedinProfile ? '✓' : '○'}
              </div>
              <div className="text-sm text-[#94A3B8] mt-1">Профили</div>
            </motion.div>
          </div>

          {/* Key details */}
          <div className="space-y-3 pt-4 border-t border-[#475569]/30">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-1">📧</span>
              <div>
                <p className="text-xs text-[#94A3B8]">Почта</p>
                <p className="text-sm text-[#E2E8F0] font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg mt-1">📱</span>
              <div>
                <p className="text-xs text-[#94A3B8]">Телефон</p>
                <p className="text-sm text-[#E2E8F0] font-medium">{profile.phone}</p>
              </div>
            </div>

            {profile.linkedinProfile && (
              <div className="flex items-start gap-3">
                <span className="text-lg mt-1">💼</span>
                <div>
                  <p className="text-xs text-[#94A3B8]">LinkedIn</p>
                  <a
                    href={
                      profile.linkedinProfile.startsWith('http')
                        ? profile.linkedinProfile
                        : `https://${profile.linkedinProfile}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium break-all"
                  >
                    {profile.linkedinProfile}
                  </a>
                </div>
              </div>
            )}

            {profile.githubUrl && (
              <div className="flex items-start gap-3">
                <span className="text-lg mt-1">🐙</span>
                <div>
                  <p className="text-xs text-[#94A3B8]">GitHub</p>
                  <a
                    href={
                      profile.githubUrl.startsWith('http')
                        ? profile.githubUrl
                        : `https://${profile.githubUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium break-all"
                  >
                    {profile.githubUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* What's next */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
        className="p-4 rounded-lg bg-[rgba(168,85,247,0.05)] border border-purple-500/20"
      >
        <p className="text-xs font-semibold text-[#E2E8F0] mb-2">Что дальше? 👇</p>
        <ul className="space-y-2 text-xs text-[#94A3B8]">
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">1.</span> Выберите уровень и направление собеседования
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">2.</span> Решайте реальные задачи кодирования
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">3.</span> Получайте умные рекомендации в реальном времени
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">4.</span> Получите персональный отчет о результатах
          </li>
        </ul>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
        onClick={onContinue}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-full py-5 px-8 rounded-2xl overflow-hidden group font-bold text-xl disabled:opacity-50 transition-all"
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
          <span>Начать собеседование</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            →
          </motion.span>
        </div>
      </motion.button>

      {/* Footer message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-[#64748B] text-sm"
      >
        ✨ AI-powered interviews • 🧪 Real-time feedback • 📊 Detailed analytics
      </motion.p>
    </div>
  );
}
