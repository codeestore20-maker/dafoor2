import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  currentStep: number;
  completeStep: () => void;
  skipTour: () => void;
  resetTour: () => void;
  isActive: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem('studdy_onboarding_step');
    const savedStatus = localStorage.getItem('studdy_onboarding_active');
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
    
    if (savedStatus === 'false') {
      setIsActive(false);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem('studdy_onboarding_step', currentStep.toString());
    localStorage.setItem('studdy_onboarding_active', isActive.toString());
  }, [currentStep, isActive]);

  const completeStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentStep(100); // Finished
  };

  const resetTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  return (
    <OnboardingContext.Provider value={{ currentStep, completeStep, skipTour, resetTour, isActive }}>
      {children}
    </OnboardingContext.Provider>
  );
};
