import { motion } from 'framer-motion';

export function VibeLogo() {
  return (
    <motion.div
      className="flex items-center justify-center gap-5 mb-12"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Animated geometric logo */}
      <div className="relative w-24 h-24">
        {/* Outer hexagon border */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          <motion.polygon
            points="40,6 70,22 70,58 40,74 10,58 10,22"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Inner animated circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="15"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </svg>

        {/* Pulsing center circle with ripple */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: [
              '0 0 0 0 rgba(168, 85, 247, 0.7)',
              '0 0 0 15px rgba(168, 85, 247, 0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* Orbiting particles */}
        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-3px',
              marginTop: '-3px',
            }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * 30,
              y: Math.sin((angle * Math.PI) / 180) * 30,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Text branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col gap-0"
      >
        <h1 className="text-5xl font-black tracking-tighter leading-none">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Vibe
          </span>
          <span className="text-white">Code</span>
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-sm font-black text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text tracking-[0.2em] mt-1"
        >
          JAM
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
