import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding } from '../../store/userSlice';
import { SKILL_LEVEL_CONFIG, SKILL_LEVEL_ORDER } from '../../constants/skillLevels';

const LevelSelectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
  };

  const handleContinue = () => {
    if (selectedLevel) {
      dispatch(completeOnboarding({ 
        skillLevel: selectedLevel 
      }));
      // Navigate to dashboard after onboarding
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-thin tracking-tight text-zinc-100 mb-4 animate-in fade-in duration-700">
            IntelliCode
          </h1>
          <p className="text-lg text-zinc-400 font-light tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700" style={{animationDelay: '200ms'}}>
            Select your experience level
          </p>
        </div>

        {/* Level Selection Buttons - Horizontal Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {SKILL_LEVEL_ORDER.map((levelId, index) => {
            const level = SKILL_LEVEL_CONFIG[levelId];
            const isSelected = selectedLevel === levelId;
            
            return (
              <button
                key={levelId}
                onClick={() => handleLevelSelect(levelId)}
                className={`
                  group relative p-8 bg-zinc-800 hover:bg-zinc-750 
                  border border-zinc-700 hover:border-zinc-600
                  rounded-lg hover:rounded-xl
                  transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                  transform hover:scale-[1.01] hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-zinc-900/25
                  animate-in fade-in slide-in-from-bottom-4 duration-700
                  ${isSelected ? 'border-zinc-500 bg-zinc-750 scale-[1.01] -translate-y-0.5 shadow-lg shadow-zinc-900/25 rounded-xl' : ''}
                `}
                style={{animationDelay: `${400 + index * 100}ms`}}
              >
                <div className="text-center relative z-10">
                  <h3 className="text-xl font-medium text-zinc-100 mb-3 tracking-wide transition-colors duration-200 group-hover:text-white">
                    {level.label}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light transition-colors duration-200 group-hover:text-zinc-300">
                    {level.description}
                  </p>
                </div>
                
                {/* Selection indicator */}
                <div className={`
                  absolute top-6 right-6 w-2.5 h-2.5 rounded-full border border-zinc-600
                  transition-all duration-200 ease-out
                  ${isSelected 
                    ? 'bg-zinc-300 border-zinc-300 scale-110' 
                    : 'group-hover:border-zinc-500'
                  }
                `}></div>
                
                {/* Neumorphic shadow effect */}
                <div className={`
                  absolute inset-0 rounded-lg group-hover:rounded-xl
                  bg-gradient-to-br from-zinc-700/10 to-zinc-900/10 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${isSelected ? 'opacity-100 rounded-xl' : ''}
                `}></div>
                
                {/* Subtle inner shadow for depth */}
                <div className={`
                  absolute inset-0 rounded-lg group-hover:rounded-xl
                  shadow-inner shadow-zinc-900/20
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${isSelected ? 'opacity-100 rounded-xl' : ''}
                `}></div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedLevel && (
          <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-zinc-700 text-zinc-100 font-medium rounded-lg hover:bg-zinc-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelSelectionPage;
