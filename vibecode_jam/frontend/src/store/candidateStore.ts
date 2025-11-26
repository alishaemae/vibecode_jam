import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CandidateProfile {
  // Basic Info
  fullName: string;
  email: string;
  phone: string;

  // Professional Info
  yearsOfExperience: number;
  currentRole: string;
  currentCompany: string;

  // Links & Profile
  linkedinProfile: string;
  portfolioUrl: string;
  githubUrl: string;

  // Additional Info
  bio: string;
  technologyPreferences: string[];
  previousInterviewExperience: string;

  // Media
  avatarUrl?: string;
}

interface CandidateStore {
  profile: Partial<CandidateProfile>;
  currentStep: number;
  isCompleted: boolean;
  updateProfile: (data: Partial<CandidateProfile>) => void;
  setCurrentStep: (step: number) => void;
  setCompleted: (completed: boolean) => void;
  resetProfile: () => void;
  getProfile: () => Partial<CandidateProfile>;
}

const initialProfile: Partial<CandidateProfile> = {
  fullName: '',
  email: '',
  phone: '',
  yearsOfExperience: 0,
  currentRole: '',
  currentCompany: '',
  linkedinProfile: '',
  portfolioUrl: '',
  githubUrl: '',
  bio: '',
  technologyPreferences: [],
  previousInterviewExperience: 'first-time',
};

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      currentStep: 0,
      isCompleted: false,

      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      setCurrentStep: (step) =>
        set({
          currentStep: step,
        }),

      setCompleted: (completed) =>
        set({
          isCompleted: completed,
        }),

      resetProfile: () =>
        set({
          profile: initialProfile,
          currentStep: 0,
          isCompleted: false,
        }),

      getProfile: () => get().profile,
    }),
    {
      name: 'vibecode-candidate-store',
      version: 1,
    }
  )
);
