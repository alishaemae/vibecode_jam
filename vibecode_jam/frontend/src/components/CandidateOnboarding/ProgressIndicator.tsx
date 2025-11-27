import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        {stepTitles.map((title, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            {/* Circle indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base mb-2 transition-all ${
                index <= currentStep
                  ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-[rgba(71,85,105,0.3)] text-[#94A3B8] border border-[#475569]/50'
              }`}
            >
              {index < currentStep ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  ✓
                </motion.span>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Title */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-sm text-center whitespace-nowrap px-2 ${
                index <= currentStep ? 'text-[#E2E8F0] font-semibold' : 'text-[#94A3B8]'
              }`}
            >
              {title}
            </motion.span>

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <motion.div
                className="absolute top-5 left-1/2 w-12 h-0.5 -translate-x-1/2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index < currentStep ? 1 : 0.3 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                  delay: 0.2,
                }}
                style={{
                  background:
                    index < currentStep
                      ? 'linear-gradient(90deg, #06B6D4 0%, #A855F7 100%)'
                      : 'rgba(71, 85, 105, 0.3)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Animated progress line at bottom */}
      <div className="h-2 bg-[rgba(71,85,105,0.2)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 30,
          }}
        />
      </div>

      {/* Step counter */}
      <motion.div
        className="text-center mt-4 text-[#64748B] text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Step {currentStep + 1} of {totalSteps}
      </motion.div>
    </div>
  );
}
