import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/userSlice';

/**
 * WelcomeStep - First step in onboarding flow
 */
const WelcomeStep = ({ data, onNext, stepIndex }) => {
  const currentUser = useSelector(selectCurrentUser);
  const [userName, setUserName] = useState(data.userName || currentUser?.name || '');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContinue = () => {
    onNext({ userName });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userName.trim()) {
      handleContinue();
    }
  };

  return (
    <div className={`
      text-center transform transition-all duration-1000 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* Main Heading */}
      <div className={`
        mb-16 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '200ms'}}>
        <h1 className="text-6xl font-thin tracking-tight text-zinc-100 mb-6">
          Welcome to
          <br />
          <span className="text-zinc-300 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            IntelliCode
          </span>
        </h1>
        <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
          Your personalized journey to master Data Structures & Algorithms starts here.
          <br />
          Let's get to know you better.
        </p>
      </div>

      {/* Name Input Section */}
      <div className={`
        max-w-md mx-auto mb-16 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '400ms'}}>
        <div className="text-left mb-4">
          <label className="block text-zinc-300 text-sm font-light mb-3 tracking-wide">
            What should we call you?
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your name"
            className="
              w-full px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-lg 
              text-zinc-100 placeholder-zinc-500 font-light tracking-wide
              focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600 focus:ring-opacity-50
              transition-all duration-300 ease-out
              hover:border-zinc-600
            "
            autoFocus
          />
        </div>
        
        {userName && (
          <div className={`
            text-center animate-in fade-in slide-in-from-bottom-2 duration-500
          `}>
            <p className="text-zinc-400 text-sm mb-6">
              Nice to meet you, <span className="text-zinc-200 font-medium">{userName}</span>!
            </p>
          </div>
        )}
      </div>

      {/* Features Preview */}
      <div className={`
        grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '600ms'}}>
        {[
          {
            icon: (
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            title: "Personalized Learning",
            description: "Adaptive content that grows with your skills"
          },
          {
            icon: (
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            title: "Progress Tracking",
            description: "Detailed analytics and learning insights"
          },
          {
            icon: (
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            ),
            title: "Achievement System",
            description: "Earn badges and track your milestones"
          }
        ].map((feature, index) => (
          <div
            key={index}
            className={`
              p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-lg
              transform transition-all duration-700 ease-out hover:scale-105
              hover:bg-zinc-800/70 hover:border-zinc-600/50
              group cursor-pointer
            `}
            style={{animationDelay: `${800 + index * 100}ms`}}
          >
            <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-lg font-medium text-zinc-100 mb-2 group-hover:text-white transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-light group-hover:text-zinc-300 transition-colors duration-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className={`
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '1200ms'}}>
        <button
          onClick={handleContinue}
          disabled={!userName.trim()}
          className={`
            px-12 py-4 font-medium rounded-lg transition-all duration-300 ease-out
            transform hover:scale-105 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
            ${userName.trim()
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg shadow-zinc-900/25'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          {userName.trim() ? 'Let\'s Begin' : 'Enter your name to continue'}
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
