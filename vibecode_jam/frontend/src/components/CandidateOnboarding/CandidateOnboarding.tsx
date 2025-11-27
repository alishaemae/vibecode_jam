import { motion, AnimatePresence } from 'framer-motion';
import { useCandidateStore } from '../../store/candidateStore';
import { ProgressIndicator } from './ProgressIndicator';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2ProfessionalInfo } from './Step2ProfessionalInfo';
import { Step3ProfileLinks } from './Step3ProfileLinks';
import { Step4PreferencesAndBio } from './Step4PreferencesAndBio';
import { CompletionScreen } from './CompletionScreen';

interface CandidateOnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  { title: 'Basic Info', icon: '👤' },
  { title: 'Professional', icon: '💼' },
  { title: 'Profiles', icon: '🔗' },
  { title: 'Preferences', icon: '⚙️' },
];

export function CandidateOnboarding({ onComplete }: CandidateOnboardingProps) {
  const { currentStep, setCurrentStep, isCompleted } = useCandidateStore();

  // Validation logic for each step
  const validateStep = (step: number): boolean => {
    const { profile } = useCandidateStore.getState();

    switch (step) {
      case 0: // Basic Info
        return !!(
          profile.fullName?.trim() &&
          profile.email?.trim() &&
          profile.phone?.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email || '')
        );
      case 1: // Professional Info
        return !!(
          profile.yearsOfExperience !== undefined &&
          profile.currentRole?.trim() &&
          profile.currentCompany?.trim()
        );
      case 2: // Profile Links
        // All fields are optional, so this is always valid
        return true;
      case 3: // Preferences
        return !!(profile.bio?.trim() && profile.bio.trim().length >= 10);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        useCandidateStore.setState({ isCompleted: true });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const stepTitles = STEPS.map((s) => s.title);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1a1a2e] to-[#16213e] flex flex-col p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl opacity-30 -z-10"
      />
      <motion.div
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 30, repeat: Infinity, delay: 2 }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl opacity-30 -z-10"
      />

      {/* Main container with form and preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col flex-grow"
      >
        {/* Form section */}
        <div className="w-full flex flex-col flex-grow">
          {/* Glow effect background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 rounded-3xl blur-2xl -z-10"
          />

          {/* Main card */}
          <div className="relative backdrop-blur-2xl bg-[rgba(15,23,42,0.8)] border border-[rgba(100,116,139,0.2)] rounded-3xl p-8 shadow-2xl shadow-purple-900/30 w-full max-w-2xl mx-auto flex flex-col flex-grow">
          {/* Inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full flex-grow">
            {/* Header with logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-6"
            >
              <div className="flex justify-center mb-4">
                <span className="text-5xl">✨</span>
              </div>
              <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2">VibeCode Interview</h1>
              <p className="text-[#94A3B8] text-sm">Complete your profile to get started</p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              key={`progress-${currentStep}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={STEPS.length}
                stepTitles={stepTitles}
              />
            </motion.div>

            {/* Form content with animation */}
            <div className="flex-grow flex items-center justify-center overflow-y-auto mb-6">
              <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                {!isCompleted ? (
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4 }}
                  >
                    {currentStep === 0 && <Step1BasicInfo />}
                    {currentStep === 1 && <Step2ProfessionalInfo />}
                    {currentStep === 2 && <Step3ProfileLinks />}
                    {currentStep === 3 && <Step4PreferencesAndBio />}
                  </motion.div>
                ) : (
                  <motion.div
                    key="completion"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CompletionScreen onContinue={onComplete} />
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation buttons */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 flex gap-3"
              >
                {/* Previous button */}
                {currentStep > 0 && (
                  <motion.button
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 px-4 rounded-lg border border-[#475569]/50 text-[#94A3B8] hover:bg-[rgba(51,65,85,0.3)] transition-all font-medium"
                  >
                    ← Previous
                  </motion.button>
                )}

                {/* Skip button (only on optional steps) */}
                {currentStep === 2 && (
                  <motion.button
                    onClick={handleSkip}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-3 px-4 rounded-lg text-[#94A3B8] text-sm hover:text-[#E2E8F0] transition-all"
                  >
                    Skip
                  </motion.button>
                )}

                {/* Next/Continue button */}
                <motion.button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep) && currentStep !== 2}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {currentStep === STEPS.length - 1 ? 'Complete' : 'Next →'}
                </motion.button>
              </motion.div>
            )}

            {/* Step indicator text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-[#64748B] text-xs mt-4"
            >
              {isCompleted
                ? 'All set! Get ready for your interview'
                : `Step ${currentStep + 1} of ${STEPS.length}`}
            </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
