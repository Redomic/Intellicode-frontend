import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding, setCurrentUser } from '../store/userSlice';
import useAuth from '../hooks/useAuth';

// Import step components
import WelcomeStep from './onboarding/WelcomeStep';
import GoalsStep from './onboarding/GoalsStep';
import PreferencesStep from './onboarding/PreferencesStep';
import SkillLevelStep from './onboarding/SkillLevelStep';
import AssessmentStep from './onboarding/AssessmentStep';
import CompletionStep from './onboarding/CompletionStep';

/**
 * OnboardingFlow component managing the multi-step onboarding process
 */
const OnboardingFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    goals: [],
    preferences: {
      studyTime: '',
      difficulty: 'adaptive',
      notifications: true,
      topics: []
    },
    skillLevel: null,
    userName: '',
    assessmentResult: null,
    expertiseRank: null
  });

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: GoalsStep, title: 'Goals' },
    { component: PreferencesStep, title: 'Preferences' },
    { component: SkillLevelStep, title: 'Skill Level' },
    { component: AssessmentStep, title: 'Assessment' },
    { component: CompletionStep, title: 'Complete' }
  ];

  const handleNext = async (stepData = {}) => {
    const newData = { ...onboardingData, ...stepData };
    setOnboardingData(newData);

    // Handle case where user has already completed onboarding (strict validation)
    if (stepData.skipToCompletion) {
      console.log('Skipping to completion - user already completed onboarding');
      
      // Refresh user data to get most recent state from backend
      try {
        const updatedUser = await getCurrentUser();
        dispatch(setCurrentUser(updatedUser));
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
      
      navigate('/dashboard');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      dispatch(completeOnboarding({
        skillLevel: newData.skillLevel,
        username: newData.userName,
        goals: newData.goals,
        preferences: newData.preferences,
        assessmentResult: newData.assessmentResult,
        expertiseRank: newData.expertiseRank
      }));
      
      // Refresh user data to get updated onboarding status from backend
      try {
        const updatedUser = await getCurrentUser();
        dispatch(setCurrentUser(updatedUser));
      } catch (error) {
        console.error('Failed to refresh user data after onboarding:', error);
      }
      
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-zinc-900 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 opacity-50"></div>
      
      {/* Progress Indicator */}
      <div className="absolute top-4 left-0 right-0 z-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`
                      w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ease-out
                      ${index <= currentStep 
                        ? 'bg-zinc-300 scale-110' 
                        : 'bg-zinc-700'
                      }
                      ${index === currentStep ? 'ring-1 sm:ring-2 ring-zinc-500 ring-offset-1 sm:ring-offset-2 ring-offset-zinc-900' : ''}
                    `}
                  />
                  {index < steps.length - 1 && (
                    <div 
                      className={`
                        w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ease-out
                        ${index < currentStep ? 'bg-zinc-300' : 'bg-zinc-700'}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2 sm:mt-3">
            <span className="text-xs text-zinc-500 font-light tracking-wide">
              Step {currentStep + 1} of {steps.length} • {steps[currentStep].title}
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="pt-20 pb-8 px-4 sm:px-6 relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <CurrentStepComponent
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
            canGoBack={currentStep > 0}
            stepIndex={currentStep}
          />
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-zinc-800 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-zinc-700 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
