import { motion } from 'framer-motion';
import { useCandidateStore } from '../../store/candidateStore';

export function ProfilePreview() {
  const { profile } = useCandidateStore();

  const fields = [
    { label: 'Full Name', value: profile.fullName, icon: '👤' },
    { label: 'Email', value: profile.email, icon: '📧' },
    { label: 'Phone', value: profile.phone, icon: '📱' },
    { label: 'Experience', value: `${profile.yearsOfExperience} years`, icon: '📈' },
    { label: 'Current Role', value: profile.currentRole, icon: '💼' },
    { label: 'Company', value: profile.currentCompany, icon: '🏢' },
    { label: 'LinkedIn', value: profile.linkedinProfile ? 'Added' : 'Not added', icon: '🔗' },
    { label: 'GitHub', value: profile.githubUrl ? 'Added' : 'Not added', icon: '🐙' },
    { label: 'Portfolio', value: profile.portfolioUrl ? 'Added' : 'Not added', icon: '🌐' },
    { label: 'Technologies', value: `${profile.technologyPreferences?.length || 0} selected`, icon: '🔧' },
    { label: 'Bio', value: profile.bio ? `${profile.bio.length} characters` : 'Not filled', icon: '📝' },
  ];

  const completedFields = fields.filter(f => f.value && f.value !== 'Not added' && f.value !== '0 selected' && f.value !== 'Not filled').length;
  const progress = Math.round((completedFields / fields.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="hidden lg:flex flex-col w-80 gap-6"
    >
      {/* Profile Card */}
      <div className="glass-light rounded-2xl p-6 overflow-hidden">
        {/* Header with gradient */}
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5 mx-auto mb-4 shadow-lg"
          >
            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
          </motion.div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-[#E2E8F0]">
              {profile.fullName || 'Your Profile'}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              {profile.currentRole || 'Role not set'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
              Profile Complete
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold text-cyan-400"
            >
              {progress}%
            </motion.p>
          </div>
          <div className="w-full bg-[#334155]/30 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Fields List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {fields.map((field, index) => {
            const isCompleted =
              field.value &&
              field.value !== 'Not added' &&
              field.value !== '0 selected' &&
              field.value !== 'Not filled';

            return (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.02 }}
                className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                  isCompleted
                    ? 'bg-[rgba(16,185,129,0.1)]'
                    : 'bg-[rgba(71,85,105,0.1)]'
                }`}
              >
                <span className="text-lg mt-0.5">{field.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      isCompleted ? 'text-[#E2E8F0]' : 'text-[#64748B] italic'
                    }`}
                  >
                    {field.value || 'Not filled'}
                  </p>
                </div>
                {isCompleted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[#10B981] font-bold text-lg flex-shrink-0"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-light rounded-2xl p-4 text-center"
      >
        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          {completedFields}/{fields.length}
        </p>
        <p className="text-xs text-[#94A3B8] mt-1">Fields Completed</p>
      </motion.div>
    </motion.div>
  );
}
