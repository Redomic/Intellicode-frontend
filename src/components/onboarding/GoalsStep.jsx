import React, { useState, useEffect } from 'react';

/**
 * GoalsStep - Second step for selecting learning goals
 */
const GoalsStep = ({ data, onNext, onBack, canGoBack, stepIndex }) => {
  const [selectedGoals, setSelectedGoals] = useState(data.goals || []);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const goalOptions = [
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
      description: 'Master technical interviews at top tech companies',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10l4-2 4 2V8" />
        </svg>
      ),
      color: 'from-blue-500/20 to-blue-600/10'
    },
    {
      id: 'competitive-programming',
      title: 'Competitive Programming',
      description: 'Excel in coding competitions and contests',
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-yellow-500/20 to-yellow-600/10'
    },
    {
      id: 'university-coursework',
      title: 'University Coursework',
      description: 'Supplement your computer science education',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      color: 'from-green-500/20 to-green-600/10'
    },
    {
      id: 'skill-improvement',
      title: 'Skill Improvement',
      description: 'Strengthen problem-solving fundamentals',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'from-purple-500/20 to-purple-600/10'
    },
    {
      id: 'career-switch',
      title: 'Career Transition',
      description: 'Build technical skills for a new career path',
      icon: (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      color: 'from-red-500/20 to-red-600/10'
    },
    {
      id: 'curiosity',
      title: 'Personal Interest',
      description: 'Learn for the joy of understanding algorithms',
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'from-cyan-500/20 to-cyan-600/10'
    }
  ];

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    onNext({ goals: selectedGoals });
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
          What are your
          <br />
          <span className="text-zinc-300">learning goals?</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
          Select all that apply. We'll personalize your experience based on your goals.
        </p>
      </div>

      {/* Goal Selection Grid */}
      <div className={`
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '400ms'}}>
        {goalOptions.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <button
              key={goal.id}
              onClick={() => handleGoalToggle(goal.id)}
              className={`
                group relative p-6 text-left rounded-lg border transition-all duration-300 ease-out
                transform hover:scale-[1.02] hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                animate-in fade-in slide-in-from-bottom-4 duration-700
                ${isSelected 
                  ? 'bg-zinc-800 border-zinc-500 shadow-lg shadow-zinc-900/25 scale-[1.02] -translate-y-1' 
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/70'
                }
              `}
              style={{animationDelay: `${600 + index * 100}ms`}}
            >
              {/* Background Gradient */}
              <div className={`
                absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-br ${goal.color}
                ${isSelected ? 'opacity-100' : ''}
              `}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    group-hover:scale-110 transition-transform duration-300
                    ${isSelected ? 'scale-110' : ''}
                  `}>
                    {goal.icon}
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200 ease-out
                    ${isSelected 
                      ? 'bg-zinc-300 border-zinc-300 scale-110' 
                      : 'border-zinc-600 group-hover:border-zinc-500'
                    }
                  `}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-zinc-800 absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <h3 className={`
                  text-lg font-medium text-zinc-100 mb-2 transition-colors duration-300
                  ${isSelected ? 'text-white' : 'group-hover:text-white'}
                `}>
                  {goal.title}
                </h3>
                
                <p className={`
                  text-zinc-400 text-sm leading-relaxed font-light transition-colors duration-300
                  ${isSelected ? 'text-zinc-300' : 'group-hover:text-zinc-300'}
                `}>
                  {goal.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedGoals.length > 0 && (
        <div className={`
          mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500
        `}>
          <p className="text-zinc-400 text-sm mb-2">
            You've selected <span className="text-zinc-200 font-medium">{selectedGoals.length}</span> goal{selectedGoals.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {selectedGoals.map(goalId => {
              const goal = goalOptions.find(g => g.id === goalId);
              return (
                <span key={goalId} className="px-3 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                  {goal?.title}
                </span>
              );
            })}
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
          disabled={selectedGoals.length === 0}
          className={`
            px-8 py-3 font-medium rounded-lg transition-all duration-300 ease-out
            transform hover:scale-105 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
            ${selectedGoals.length > 0
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg shadow-zinc-900/25'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }
            ${!canGoBack ? 'ml-auto' : ''}
          `}
        >
          {selectedGoals.length > 0 ? 'Continue' : 'Select at least one goal'}
        </button>
      </div>
    </div>
  );
};

export default GoalsStep;
