import React, { useState, useEffect } from 'react';

/**
 * PreferencesStep - Third step for setting learning preferences
 */
const PreferencesStep = ({ data, onNext, onBack, canGoBack, stepIndex }) => {
  const [preferences, setPreferences] = useState({
    studyTime: data.preferences?.studyTime || '',
    difficulty: data.preferences?.difficulty || 'adaptive'
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const studyTimeOptions = [
    { value: '15-30', label: '15-30 minutes', description: 'Quick daily sessions' },
    { value: '30-60', label: '30-60 minutes', description: 'Standard study sessions' },
    { value: '60-120', label: '1-2 hours', description: 'Deep learning sessions' },
    { value: '120+', label: '2+ hours', description: 'Intensive study periods' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Start Easy', description: 'Begin with fundamentals and build up gradually' },
    { value: 'adaptive', label: 'Adaptive', description: 'Let AI adjust difficulty based on your performance' },
    { value: 'challenging', label: 'Challenge Me', description: 'Jump into intermediate and advanced problems' }
  ];



  const handlePreferenceUpdate = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };



  const handleContinue = () => {
    onNext({ preferences });
  };

  const isFormValid = preferences.studyTime && preferences.difficulty;

  return (
    <div className={`
      text-center transform transition-all duration-1000 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* Header */}
      <div className={`
        mb-16 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '200ms'}}>
        <h1 className="text-5xl font-thin tracking-tight text-zinc-100 mb-6">
          Customize your
          <br />
          <span className="text-zinc-300">learning experience</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
          Help us tailor the perfect learning path for you.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Study Time Preference */}
        <div className={`
          transform transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `} style={{animationDelay: '400ms'}}>
          <h3 className="text-xl font-medium text-zinc-100 mb-6 text-left">
            How much time can you dedicate daily?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {studyTimeOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handlePreferenceUpdate('studyTime', option.value)}
                className={`
                  p-4 text-left rounded-lg border transition-all duration-300 ease-out
                  transform hover:scale-105 hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                  animate-in fade-in slide-in-from-bottom-4 duration-700
                  ${preferences.studyTime === option.value
                    ? 'bg-zinc-800 border-zinc-500 shadow-lg shadow-zinc-900/25 scale-105 -translate-y-1'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/70'
                  }
                `}
                style={{animationDelay: `${600 + index * 100}ms`}}
              >
                <h4 className="font-medium text-zinc-100 mb-1">{option.label}</h4>
                <p className="text-zinc-400 text-sm">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Preference */}
        <div className={`
          transform transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `} style={{animationDelay: '800ms'}}>
          <h3 className="text-xl font-medium text-zinc-100 mb-6 text-left">
            What difficulty level would you prefer?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficultyOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handlePreferenceUpdate('difficulty', option.value)}
                className={`
                  p-6 text-left rounded-lg border transition-all duration-300 ease-out
                  transform hover:scale-105 hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                  animate-in fade-in slide-in-from-bottom-4 duration-700
                  ${preferences.difficulty === option.value
                    ? 'bg-zinc-800 border-zinc-500 shadow-lg shadow-zinc-900/25 scale-105 -translate-y-1'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/70'
                  }
                `}
                style={{animationDelay: `${1000 + index * 100}ms`}}
              >
                <h4 className="font-medium text-zinc-100 mb-2">{option.label}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{option.description}</p>
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* Navigation Buttons */}
      <div className={`
        flex items-center justify-between max-w-md mx-auto mt-16
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '1400ms'}}>
        {canGoBack && (
          <button
            onClick={onBack}
            className="
              px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
              rounded-lg hover:bg-zinc-800/50
            "
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`
            px-8 py-3 font-medium rounded-lg transition-all duration-300 ease-out
            transform hover:scale-105 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
            ${isFormValid
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg shadow-zinc-900/25'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }
            ${!canGoBack ? 'ml-auto' : ''}
          `}
        >
          {isFormValid ? 'Continue' : 'Please complete required fields'}
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;
