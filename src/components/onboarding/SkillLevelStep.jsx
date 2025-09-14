import React, { useState, useEffect } from 'react';
import { SKILL_LEVEL_CONFIG, SKILL_LEVEL_ORDER } from '../../constants/skillLevels';

/**
 * SkillLevelStep - Fourth step for selecting skill level
 */
const SkillLevelStep = ({ data, onNext, onBack, canGoBack, stepIndex }) => {
  const [selectedLevel, setSelectedLevel] = useState(data.skillLevel || null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
  };

  const handleContinue = () => {
    if (selectedLevel) {
      onNext({ skillLevel: selectedLevel });
    }
  };

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
          What's your current
          <br />
          <span className="text-zinc-300">skill level?</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
          This helps us recommend the right starting point and pace for your learning journey.
        </p>
      </div>

      {/* Skill Assessment Helper */}
      <div className={`
        max-w-3xl mx-auto mb-12 p-6 bg-zinc-800/30 border border-zinc-700/50 rounded-lg
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '400ms'}}>
        <h3 className="text-lg font-medium text-zinc-100 mb-4">Not sure? Here's a quick guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-left">
            <h4 className="text-zinc-200 font-medium mb-2">Beginner</h4>
            <ul className="text-zinc-400 space-y-1">
              <li>• New to programming</li>
              <li>• Learning basic concepts</li>
              <li>• Want structured guidance</li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="text-zinc-200 font-medium mb-2">Intermediate</h4>
            <ul className="text-zinc-400 space-y-1">
              <li>• Know basic data structures</li>
              <li>• Solved some problems</li>
              <li>• Want to improve skills</li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="text-zinc-200 font-medium mb-2">Advanced</h4>
            <ul className="text-zinc-400 space-y-1">
              <li>• Comfortable with algorithms</li>
              <li>• Preparing for interviews</li>
              <li>• Want challenging problems</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Level Selection */}
      <div className={`
        grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '600ms'}}>
        {SKILL_LEVEL_ORDER.map((levelId, index) => {
          const level = SKILL_LEVEL_CONFIG[levelId];
          const isSelected = selectedLevel === levelId;
          
          return (
            <button
              key={levelId}
              onClick={() => handleLevelSelect(levelId)}
              className={`
                group relative p-8 rounded-lg border transition-all duration-300 ease-out
                transform hover:scale-[1.02] hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                animate-in fade-in slide-in-from-bottom-4 duration-700
                ${isSelected 
                  ? 'bg-zinc-800 border-zinc-500 shadow-lg shadow-zinc-900/25 scale-[1.02] -translate-y-1' 
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/70'
                }
              `}
              style={{animationDelay: `${800 + index * 100}ms`}}
            >
              <div className="text-center relative z-10">
                {/* Level Icon/Indicator */}
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300
                  ${isSelected 
                    ? 'border-zinc-400 bg-zinc-700 scale-110' 
                    : 'border-zinc-600 group-hover:border-zinc-500 group-hover:bg-zinc-700/50'
                  }
                `}>
                  <div className={`
                    w-6 h-6 transition-all duration-300 flex items-center justify-center
                    ${isSelected ? 'text-zinc-200 scale-110' : 'text-zinc-400 group-hover:text-zinc-300'}
                  `}>
                    {index === 0 ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : index === 1 ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className={`
                  text-xl font-medium mb-3 tracking-wide transition-colors duration-300
                  ${isSelected ? 'text-white' : 'text-zinc-100 group-hover:text-white'}
                `}>
                  {level.label}
                </h3>
                
                <p className={`
                  text-zinc-400 text-sm leading-relaxed font-light transition-colors duration-300
                  ${isSelected ? 'text-zinc-300' : 'group-hover:text-zinc-300'}
                `}>
                  {level.description}
                </p>

                {/* Skill Examples */}
                <div className="mt-4 pt-4 border-t border-zinc-700/50">
                  <p className="text-xs text-zinc-500 mb-2">You'll learn:</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {level.examples?.slice(0, 3).map((example, i) => (
                      <span key={i} className="px-2 py-1 bg-zinc-700/50 text-zinc-400 text-xs rounded">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Selection Indicator */}
              <div className={`
                absolute top-6 right-6 w-3 h-3 rounded-full border border-zinc-600
                transition-all duration-200 ease-out
                ${isSelected 
                  ? 'bg-zinc-300 border-zinc-300 scale-110' 
                  : 'group-hover:border-zinc-500'
                }
              `}></div>
              
              {/* Background Effects */}
              <div className={`
                absolute inset-0 rounded-lg
                bg-gradient-to-br from-zinc-700/10 to-zinc-900/10 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${isSelected ? 'opacity-100' : ''}
              `}></div>
            </button>
          );
        })}
      </div>

      {/* Selected Level Summary */}
      {selectedLevel && (
        <div className={`
          max-w-md mx-auto mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500
        `}>
          <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <p className="text-zinc-400 text-sm mb-1">Selected level:</p>
            <p className="text-zinc-200 font-medium">
              {SKILL_LEVEL_CONFIG[selectedLevel]?.label}
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              Don't worry, you can always adjust this later!
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={`
        flex items-center justify-between max-w-md mx-auto
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '1200ms'}}>
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
          disabled={!selectedLevel}
          className={`
            px-8 py-3 font-medium rounded-lg transition-all duration-300 ease-out
            transform hover:scale-105 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
            ${selectedLevel
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg shadow-zinc-900/25'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }
            ${!canGoBack ? 'ml-auto' : ''}
          `}
        >
          {selectedLevel ? 'Continue' : 'Please select your level'}
        </button>
      </div>
    </div>
  );
};

export default SkillLevelStep;
