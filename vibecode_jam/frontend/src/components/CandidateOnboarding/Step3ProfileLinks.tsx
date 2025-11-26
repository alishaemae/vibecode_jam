import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCandidateStore } from '../../store/candidateStore';

interface FormErrors {
  linkedinProfile?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export function Step3ProfileLinks() {
  const { profile, updateProfile } = useCandidateStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateUrl = (url: string, platform: string): string | undefined => {
    if (!url) return undefined; // Optional field

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);

      switch (platform) {
        case 'linkedin':
          if (!urlObj.hostname.includes('linkedin.com'))
            return 'Please enter a valid LinkedIn URL';
          break;
        case 'github':
          if (!urlObj.hostname.includes('github.com')) return 'Please enter a valid GitHub URL';
          break;
        case 'portfolio':
          // Any valid URL is fine for portfolio
          break;
      }
      return undefined;
    } catch {
      return `Invalid URL format`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateProfile({ [name]: value });

    if (touched.has(name)) {
      const error = validateUrl(value, name);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newTouched = new Set(touched);
    newTouched.add(name);
    setTouched(newTouched);

    const error = validateUrl(value, name);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const links = [
    {
      name: 'githubUrl',
      label: 'GitHub профиль',
      icon: '🐙',
      placeholder: 'github.com/ваше-имя',
      description: 'Ваше портфолио кода',
      color: 'from-slate-600 to-slate-900',
    },
    {
      name: 'portfolioUrl',
      label: 'Ваш сайт',
      icon: '🌐',
      placeholder: 'example.com',
      description: 'Ваш персональный сайт (опционально)',
      color: 'from-orange-500 to-pink-500',
    },
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
          <span className="text-5xl">🔗</span> Ваши профили
        </h2>
        <p className="text-[#94A3B8] text-base">Добавьте ссылки на ваши профили (опционально)</p>
      </motion.div>

      {/* Links Grid */}
      <div className="space-y-7">
        {links.map((link, index) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
            className="group"
          >
            {/* Card container */}
            <div className={`p-6 rounded-xl border-2 transition-all ${
              errors[link.name as keyof FormErrors]
                ? 'bg-[rgba(239,68,68,0.05)] border-red-500/30'
                : 'bg-[rgba(51,65,85,0.2)] border-[#475569]/50 group-hover:border-cyan-500/30 group-hover:bg-[rgba(51,65,85,0.3)]'
            }`}>
              {/* Label with icon */}
              <label className="block text-base font-semibold text-[#E2E8F0] mb-2 flex items-center gap-3">
                <span className="text-2xl">{link.icon}</span>
                {link.label}
                {link.name === 'portfolioUrl' && (
                  <span className="text-sm text-[#64748B] font-normal ml-auto">Опционально</span>
                )}
              </label>

              {/* Description */}
              <p className="text-sm text-[#94A3B8] mb-4 font-light">{link.description}</p>

              {/* Input */}
              <div className="relative">
                <input
                  type="text"
                  name={link.name}
                  value={(profile[link.name as keyof typeof profile] as string) || ''}
                  placeholder={link.placeholder}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-6 py-4 rounded-lg backdrop-blur-xl transition-all text-lg font-medium ${
                    errors[link.name as keyof FormErrors]
                      ? 'bg-[rgba(239,68,68,0.1)] border-2 border-red-500/50 focus:border-red-500'
                      : 'bg-[rgba(30,41,59,0.5)] border-2 border-[#475569]/50 focus:border-cyan-500'
                  } text-[#E2E8F0] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />

                {/* Validation icon */}
                {touched.has(link.name) && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-xl"
                  >
                    {errors[link.name as keyof FormErrors] ? (
                      <span className="text-red-400">✕</span>
                    ) : (
                      <span className="text-green-400">✓</span>
                    )}
                  </motion.span>
                )}
              </div>

              {/* Error message */}
              {errors[link.name as keyof FormErrors] && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2 font-medium"
                >
                  <span>⚠</span> {errors[link.name as keyof FormErrors]}
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile preview cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 gap-4 mt-8 pt-6 border-t border-[#475569]/30"
      >
        <p className="text-sm font-semibold text-[#E2E8F0]">💡 Quick Links Preview</p>

        <div className="space-y-2">
          {links.map((link) => {
            const value = (profile[link.name as keyof typeof profile] as string) || '';
            const hasValue = value.trim().length > 0;

            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + links.indexOf(link) * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(51,65,85,0.2)] border border-[#475569]/30"
              >
                <span className="text-lg">{link.icon}</span>
                {hasValue ? (
                  <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 truncate hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm text-[#64748B] italic">Not provided</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tips section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-lg bg-[rgba(168,85,247,0.05)] border border-purple-500/20"
      >
        <p className="text-xs text-[#94A3B8] font-semibold mb-2">📌 Pro Tips</p>
        <ul className="text-xs text-[#94A3B8] space-y-1">
          <li>• Your GitHub profile helps us understand your coding style</li>
          <li>• Keep your LinkedIn profile up-to-date</li>
          <li>• Portfolio is optional but recommended</li>
        </ul>
      </motion.div>
    </div>
  );
}
