import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCandidateStore } from '../../store/candidateStore';

interface FormErrors {
  bio?: string;
}

const TECHNOLOGIES = [
  { id: 'javascript', label: 'JavaScript', icon: '⚡' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'vue', label: 'Vue', icon: '💚' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'cpp', label: 'C++', icon: '⚙️' },
  { id: 'golang', label: 'Go', icon: '🐹' },
  { id: 'rust', label: 'Rust', icon: '🦀' },
  { id: 'nodejs', label: 'Node.js', icon: '🟢' },
  { id: 'django', label: 'Django', icon: '🎭' },
  { id: 'sql', label: 'SQL', icon: '🗄️' },
  { id: 'mongodb', label: 'MongoDB', icon: '🍃' },
  { id: 'aws', label: 'AWS', icon: '☁️' },
  { id: 'docker', label: 'Docker', icon: '🐳' },
  { id: 'kubernetes', label: 'Kubernetes', icon: '⛵' },
];

export function Step4PreferencesAndBio() {
  const { profile, updateProfile } = useCandidateStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateBio = (bio: string): string | undefined => {
    if (!bio.trim()) return 'Please tell us about yourself';
    if (bio.trim().length < 10) return 'Bio must be at least 10 characters';
    if (bio.trim().length > 500) return 'Bio must be less than 500 characters';
    return undefined;
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    updateProfile({ bio: value });

    if (touched.has('bio')) {
      const error = validateBio(value);
      setErrors((prev) => ({
        ...prev,
        bio: error,
      }));
    }
  };

  const handleBioBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const newTouched = new Set(touched);
    newTouched.add('bio');
    setTouched(newTouched);

    const error = validateBio(value);
    setErrors((prev) => ({
      ...prev,
      bio: error,
    }));
  };

  const toggleTechnology = (techId: string) => {
    const current = (profile.technologyPreferences || []) as string[];
    const updated = current.includes(techId)
      ? current.filter((t) => t !== techId)
      : [...current, techId];
    updateProfile({ technologyPreferences: updated });
  };

  const selectedTechs = (profile.technologyPreferences || []) as string[];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-4"
      >
        <h2 className="text-3xl font-semibold text-[#E2E8F0] mb-2 flex items-center justify-center gap-3">
          <span className="text-3xl">⚙️</span> Финальный шаг
        </h2>
        <p className="text-[#94A3B8] text-base">Технологии и немного о себе</p>
      </motion.div>

      {/* Technology Preferences */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-base font-semibold text-[#E2E8F0] mb-4 flex items-center gap-2">
          <span className="text-xl">🛠️</span> Технологии ({selectedTechs.length})
        </label>

        <div className="grid grid-cols-3 gap-3">
          {TECHNOLOGIES.map((tech, index) => {
            const isSelected = selectedTechs.includes(tech.id);

            return (
              <motion.button
                key={tech.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.03 }}
                onClick={() => toggleTechnology(tech.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group overflow-hidden rounded-xl p-5 text-base font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-[rgba(51,65,85,0.3)] text-[#94A3B8] border-2 border-[#475569]/50 hover:bg-[rgba(51,65,85,0.5)] hover:border-cyan-500/30'
                }`}
              >
                {/* Background shimmer on hover */}
                {!isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '100%', opacity: 0.1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-lg">{tech.icon}</span>
                  <span>{tech.label}</span>

                  {/* Checkmark animation */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="ml-auto text-sm"
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Interview Experience */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-xl bg-[rgba(51,65,85,0.2)] border border-[#475569]/50"
      >
        <label className="block text-base font-semibold text-[#E2E8F0] mb-4 flex items-center gap-2">
          <span className="text-lg">🎬</span> Опыт собеседований
        </label>

        <div className="space-y-2">
          {[
            { id: 'first-time', label: 'Первый раз', emoji: '🌱' },
            { id: 'some-experience', label: 'Некоторый опыт', emoji: '⚡' },
            { id: 'veteran', label: 'Опытный', emoji: '🚀' },
          ].map((option, index) => (
            <motion.label
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer group hover:bg-[rgba(51,65,85,0.3)] transition-all"
            >
              <input
                type="radio"
                name="previousInterviewExperience"
                value={option.id}
                checked={profile.previousInterviewExperience === option.id}
                onChange={(e) =>
                  updateProfile({ previousInterviewExperience: e.target.value })
                }
                className="w-5 h-5 cursor-pointer accent-cyan-500"
              />
              <span className="text-base">{option.emoji}</span>
              <span className="text-base text-[#E2E8F0]">{option.label}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <label className="block text-base font-semibold text-[#E2E8F0] mb-3 flex items-center gap-2">
          <span className="text-lg">📝</span> О себе
          <span className="text-sm text-[#64748B] font-normal ml-auto">
            {(profile.bio || '').length}/500
          </span>
        </label>

        <div className="relative">
          <textarea
            value={profile.bio || ''}
            onChange={handleBioChange}
            onBlur={handleBioBlur}
            placeholder="Расскажите о себе (минимум 10 символов)"
            rows={4}
            className={`w-full px-5 py-3 rounded-xl backdrop-blur-xl resize-none transition-all text-base font-medium ${
              errors.bio
                ? 'bg-[rgba(239,68,68,0.1)] border border-red-500/50 focus:border-red-500'
                : 'bg-[rgba(51,65,85,0.3)] border border-[#475569]/50 focus:border-cyan-500'
            } text-[#E2E8F0] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-cyan-500/20`}
          />

          {/* Character counter */}
          <motion.div
            className={`absolute bottom-2 right-3 text-xs font-medium ${
              (profile.bio || '').length > 450 ? 'text-red-400' : 'text-[#64748B]'
            }`}
          >
            {500 - (profile.bio || '').length}
          </motion.div>
        </div>

        {errors.bio && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1 flex items-center gap-1 font-medium"
          >
            <span>⚠</span> {errors.bio}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
