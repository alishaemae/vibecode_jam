import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCandidateStore } from '../../store/candidateStore';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

export function Step1BasicInfo() {
  const { profile, updateProfile } = useCandidateStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[\d\s\-+()]+$/.test(value)) return 'Invalid phone format';
        if (value.replace(/\D/g, '').length < 10)
          return 'Phone number must have at least 10 digits';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateProfile({ [name]: value });

    if (touched.has(name)) {
      const error = validateField(name, value);
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

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const fields = [
    { name: 'fullName', label: 'Полное имя', icon: '👤', placeholder: 'Иван Петров' },
    {
      name: 'email',
      label: 'Email адрес',
      icon: '📧',
      placeholder: 'ivan@example.com',
      type: 'email',
    },
    {
      name: 'phone',
      label: 'Номер телефона',
      icon: '📱',
      placeholder: '+7 (999) 123-45-67',
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
        <h2 className="text-3xl font-semibold text-[#E2E8F0] mb-4 flex items-center justify-center gap-4">
          <span className="text-4xl">👋</span> Добро пожаловать в VibeCode
        </h2>
        <p className="text-[#94A3B8] text-lg">Расскажите нам о себе</p>
      </motion.div>

      {/* Avatar Upload Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex justify-center mb-10"
      >
        <div className="relative group">
          {/* Avatar Circle */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-1 shadow-lg shadow-purple-500/50">
            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center text-4xl overflow-hidden relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>📷</span>
              )}
            </div>
          </div>

          {/* Upload Overlay */}
          <motion.label
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            <span className="text-2xl">+</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateProfile({ avatarUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </motion.label>
        </div>
      </motion.div>

      {/* Form Fields */}
      <div className="space-y-7">
        {fields.map((field, index) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
          >
            <label className="block text-lg font-semibold text-[#E2E8F0] mb-3 flex items-center gap-3">
              <span className="text-2xl">{field.icon}</span>
              {field.label}
            </label>

            <div className="relative">
              <input
                type={field.type || 'text'}
                name={field.name}
                value={(profile[field.name as keyof typeof profile] as string) || ''}
                placeholder={field.placeholder}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-6 py-4 rounded-xl backdrop-blur-xl transition-all text-lg font-medium ${
                  errors[field.name as keyof FormErrors]
                    ? 'bg-[rgba(239,68,68,0.1)] border-2 border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'bg-[rgba(51,65,85,0.3)] border-2 border-[#475569]/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                } text-[#E2E8F0] placeholder-[#94A3B8] outline-none`}
              />

              {/* Validation icon */}
              {touched.has(field.name) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-xl"
                >
                  {errors[field.name as keyof FormErrors] ? (
                    <span className="text-red-400">✕</span>
                  ) : (
                    <span className="text-green-400">✓</span>
                  )}
                </motion.span>
              )}
            </div>

            {/* Error message */}
            {errors[field.name as keyof FormErrors] && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2 flex items-center gap-2 font-medium"
              >
                <span>⚠</span> {errors[field.name as keyof FormErrors]}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Info message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 p-6 rounded-xl bg-[rgba(6,182,212,0.05)] border-2 border-cyan-500/20 flex gap-4"
      >
        <span className="text-2xl flex-shrink-0">ℹ️</span>
        <p className="text-base text-[#94A3B8] leading-relaxed">
          Мы используем эту информацию для персонализации вашего интервью и отправки уведомлений о вашем прогрессе.
        </p>
      </motion.div>
    </div>
  );
}
