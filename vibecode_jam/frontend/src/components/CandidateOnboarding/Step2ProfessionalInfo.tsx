import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCandidateStore } from '../../store/candidateStore';

interface FormErrors {
  yearsOfExperience?: string;
  currentRole?: string;
  currentCompany?: string;
}

export function Step2ProfessionalInfo() {
  const { profile, updateProfile } = useCandidateStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: string | number): string | undefined => {
    switch (name) {
      case 'yearsOfExperience':
        const years = typeof value === 'string' ? parseInt(value) : value;
        if (years < 0 || years > 70) return 'Please enter a valid number of years';
        return undefined;
      case 'currentRole':
        if (!value.toString().trim()) return 'Current role is required';
        if (value.toString().trim().length < 2) return 'Role must be at least 2 characters';
        return undefined;
      case 'currentCompany':
        if (!value.toString().trim()) return 'Company name is required';
        if (value.toString().trim().length < 2) return 'Company must be at least 2 characters';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateProfile({ [name]: name === 'yearsOfExperience' ? parseInt(value) : value });

    if (touched.has(name)) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newTouched = new Set(touched);
    newTouched.add(name);
    setTouched(newTouched);

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const roles = [
    'Frontend разработчик',
    'Backend разработчик',
    'Full Stack разработчик',
    'DevOps инженер',
    'Data Scientist',
    'Mobile разработчик',
    'QA инженер',
    'Software Architect',
    'Студент',
    'Другое',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-bold text-[#E2E8F0] mb-3 flex items-center justify-center gap-3">
          <span className="text-5xl">💼</span> Профессиональный опыт
        </h2>
        <p className="text-[#94A3B8] text-base">Расскажите о вашем опыте работы</p>
      </motion.div>

      {/* Experience Level Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-7 rounded-xl bg-gradient-to-br from-[rgba(6,182,212,0.1)] to-[rgba(168,85,247,0.05)] border-2 border-cyan-500/20"
      >
        <label className="block text-base font-semibold text-[#E2E8F0] mb-6 flex items-center gap-3">
          <span className="text-2xl">📊</span> Опыт работы (лет)
        </label>

        <div className="space-y-4">
          {/* Range slider */}
          <input
            type="range"
            name="yearsOfExperience"
            min="0"
            max="40"
            value={profile.yearsOfExperience || 0}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full h-2 bg-[rgba(71,85,105,0.3)] rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />

          {/* Value display with gradient badges */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <motion.span
                key={profile.yearsOfExperience}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
              >
                {profile.yearsOfExperience}
              </motion.span>
              <span className="text-[#94A3B8]">лет</span>
            </div>

            {/* Experience badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${
                  (profile.yearsOfExperience || 0) < 2
                    ? '#10B981'
                    : (profile.yearsOfExperience || 0) < 7
                      ? '#F59E0B'
                      : '#8B5CF6'
                } 0%, ${
                  (profile.yearsOfExperience || 0) < 2 ? '#059669' : (profile.yearsOfExperience || 0) < 7 ? '#D97706' : '#7C3AED'
                } 100%)`,
              }}
            >
              {(profile.yearsOfExperience || 0) < 2
                ? 'Junior'
                : (profile.yearsOfExperience || 0) < 7
                  ? 'Mid-level'
                  : 'Senior'}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Role and Company fields */}
      <div className="space-y-7">
        {/* Current Role */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <label className="block text-base font-semibold text-[#E2E8F0] mb-3 flex items-center gap-3">
            <span className="text-2xl">👨‍💼</span> Текущая должность
          </label>

          <select
            name="currentRole"
            value={profile.currentRole || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-6 py-4 rounded-xl backdrop-blur-xl transition-all text-lg font-medium ${
              errors.currentRole
                ? 'bg-[rgba(239,68,68,0.1)] border-2 border-red-500/50 focus:border-red-500'
                : 'bg-[rgba(51,65,85,0.3)] border-2 border-[#475569]/50 focus:border-cyan-500'
            } text-[#E2E8F0] outline-none focus:ring-2 focus:ring-cyan-500/20`}
          >
            <option value="">Выберите должность</option>
            {roles.map((role) => (
              <option key={role} value={role} className="bg-[#0F172A]">
                {role}
              </option>
            ))}
          </select>

          {errors.currentRole && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 font-medium"
            >
              ⚠ {errors.currentRole}
            </motion.p>
          )}
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label className="block text-base font-semibold text-[#E2E8F0] mb-3 flex items-center gap-3">
            <span className="text-2xl">🏢</span> Текущая компания
          </label>

          <input
            type="text"
            name="currentCompany"
            value={profile.currentCompany || ''}
            placeholder="Например: Google, Яндекс, Стартап"
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-6 py-4 rounded-xl backdrop-blur-xl transition-all text-lg font-medium ${
              errors.currentCompany
                ? 'bg-[rgba(239,68,68,0.1)] border-2 border-red-500/50'
                : 'bg-[rgba(51,65,85,0.3)] border-2 border-[#475569]/50 focus:border-cyan-500'
            } text-[#E2E8F0] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-cyan-500/20`}
          />

          {errors.currentCompany && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 font-medium"
            >
              ⚠ {errors.currentCompany}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Experience breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-[rgba(139,92,246,0.05)] border-2 border-purple-500/20"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-cyan-400">
              {Math.floor((profile.yearsOfExperience || 0) / 3) || 0}
            </p>
            <p className="text-sm text-[#94A3B8] mt-2 font-medium">Проектов</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-400">
              {Math.floor((profile.yearsOfExperience || 0) * 5) || 0}
            </p>
            <p className="text-sm text-[#94A3B8] mt-2 font-medium">PR примерно</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-pink-400">
              {(profile.yearsOfExperience || 0) > 3 ? '✓' : '...'}
            </p>
            <p className="text-sm text-[#94A3B8] mt-2 font-medium">Senior готов</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
