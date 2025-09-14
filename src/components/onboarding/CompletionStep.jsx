import React, { useState, useEffect } from 'react';

/**
 * CompletionStep - Final step celebrating onboarding completion
 */
const CompletionStep = ({ data, onNext, onBack, canGoBack, stepIndex }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Trigger confetti animation after initial render
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  const handleStartLearning = () => {
    onNext(); // This will complete the onboarding flow
  };

  const getGoalSummary = () => {
    if (!data.goals || data.goals.length === 0) return 'general learning';
    if (data.goals.length === 1) {
      const goalMap = {
        'interview-prep': 'interview preparation',
        'competitive-programming': 'competitive programming',
        'university-coursework': 'university coursework',
        'skill-improvement': 'skill improvement',
        'career-switch': 'career transition',
        'curiosity': 'personal enrichment'
      };
      return goalMap[data.goals[0]] || 'learning';
    }
    return `${data.goals.length} learning goals`;
  };

  const getStudyTimeText = () => {
    const timeMap = {
      '15-30': '15-30 minutes',
      '30-60': '30-60 minutes', 
      '60-120': '1-2 hours',
      '120+': '2+ hours'
    };
    return timeMap[data.preferences?.studyTime] || 'flexible time';
  };

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className={`
      text-center transform transition-all duration-1000 ease-out relative overflow-hidden
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-2 opacity-80"
              style={{
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`
              }}
            />
          ))}
        </div>
      )}

      {/* Celebration Icon */}
      <div className={`
        mb-12 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
      `} style={{animationDelay: '200ms'}}>
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-green-500/30">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className={`
        mb-16 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '400ms'}}>
        <h1 className="text-5xl font-thin tracking-tight text-zinc-100 mb-6">
          You're all set,
          <br />
          <span className="text-zinc-300">{data.userName || 'there'}!</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
          Your personalized learning journey is ready to begin. 
          We've crafted the perfect experience based on your preferences.
        </p>
      </div>

      {/* Summary Cards */}
      <div className={`
        grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '600ms'}}>
        {/* Goal Card */}
        <div className={`
          p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg
          animate-in fade-in slide-in-from-bottom-4 duration-700
        `} style={{animationDelay: '800ms'}}>
          <div className="mb-3">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-100 mb-2">Your Focus</h3>
          <p className="text-zinc-400 text-sm capitalize">{getGoalSummary()}</p>
        </div>

        {/* Schedule Card */}
        <div className={`
          p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg
          animate-in fade-in slide-in-from-bottom-4 duration-700
        `} style={{animationDelay: '900ms'}}>
          <div className="mb-3">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-100 mb-2">Study Time</h3>
          <p className="text-zinc-400 text-sm">{getStudyTimeText()} daily</p>
        </div>

        {/* Expertise Rank Card */}
        <div className={`
          p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border border-yellow-500/20 rounded-lg
          animate-in fade-in slide-in-from-bottom-4 duration-700
        `} style={{animationDelay: '1000ms'}}>
          <div className="mb-3">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-100 mb-2">Your Rank</h3>
          <div className="text-xl font-semibold text-yellow-400 mb-1">
            {data.expertiseRank || 600}
          </div>
          <p className="text-zinc-400 text-xs">
            {data.expertiseRank ? (
              data.expertiseRank < 800 ? 'Beginner Level' :
              data.expertiseRank < 1200 ? 'Intermediate Level' :
              data.expertiseRank < 1800 ? 'Advanced Level' : 'Expert Level'
            ) : 'Beginner Level'}
          </p>
        </div>
      </div>

      {/* What's Next Section */}
      <div className={`
        max-w-2xl mx-auto mb-16 p-6 bg-zinc-800/30 border border-zinc-700/50 rounded-lg
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '1200ms'}}>
        <h3 className="text-xl font-medium text-zinc-100 mb-4">What happens next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-zinc-300">1</span>
            </div>
            <p className="text-zinc-400 text-sm">Access your personalized dashboard</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-zinc-300">2</span>
            </div>
            <p className="text-zinc-400 text-sm">Start with carefully selected problems</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-zinc-300">3</span>
            </div>
            <p className="text-zinc-400 text-sm">Track your progress and level up</p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={`
        flex items-center justify-between max-w-md mx-auto
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
          onClick={handleStartLearning}
          className={`
            px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg 
            transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900
            hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25
            ${!canGoBack ? 'ml-auto' : ''}
          `}
        >
          Start Learning!
        </button>
      </div>

      {/* Custom Confetti Animation Styles */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CompletionStep;
