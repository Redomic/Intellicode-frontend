import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/userSlice';
import { useGetUserStreak } from '../../services/api';

/**
 * StreakCounter - Duolingo-style colorful streak counter
 */
const StreakCounter = ({ streak: propStreak }) => {
  // Check authentication state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  
  // Fetch streak data from backend
  const { data: streakData, loading: streakLoading, error: streakError, execute: fetchStreakData } = useGetUserStreak();

  // Fetch streak data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStreakData();
    }
  }, [isAuthenticated, user]);
  
  // Use prop streak as fallback, then backend data, then default
  const currentStreak = streakData?.current_streak ?? propStreak ?? 0;
  const longestStreak = streakData?.longest_streak ?? currentStreak;
  const hasStreak = currentStreak > 0;
  
  return (
    <div className={`w-full h-full rounded-lg p-6 shadow-lg border relative overflow-hidden transition-all duration-300 ${
      hasStreak 
        ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 border-orange-400/30' 
        : 'bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-700 border-zinc-600/30'
    }`}>
      {/* Background decorative elements */}
      <div className={`absolute inset-0 pointer-events-none ${
        hasStreak 
          ? 'bg-gradient-to-br from-yellow-400/20 via-transparent to-red-600/20' 
          : 'bg-gradient-to-br from-zinc-500/10 via-transparent to-zinc-800/20'
      }`} />
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-8 translate-x-8 ${
        hasStreak ? 'bg-yellow-300/10' : 'bg-zinc-400/5'
      }`} />
      <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-6 -translate-x-6 ${
        hasStreak ? 'bg-red-400/10' : 'bg-zinc-500/5'
      }`} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Fire Icon and Title */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
              hasStreak ? 'bg-yellow-300 animate-pulse' : 'bg-zinc-400'
            }`} />
            <div className={`relative rounded-full p-2 shadow-lg ${
              hasStreak 
                ? 'bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400' 
                : 'bg-gradient-to-t from-zinc-600 via-zinc-500 to-zinc-400'
            }`}>
              {hasStreak ? (
                <svg 
                  className="w-6 h-6 text-white drop-shadow-sm" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12.5 2C13.81 2 15.5 3.5 15.5 4.5C15.5 5.5 15 7 15 8.5C16.19 9.5 17 11 17 12.5C17 16.09 14.09 19 10.5 19S4 16.09 4 12.5C4 10.5 5 8.5 6.5 7.5C6.5 6 7.5 4.5 9.5 4.5C10.38 4.5 11.5 3.5 12.5 2ZM10.5 16.5C12.71 16.5 14.5 14.71 14.5 12.5C14.5 11.71 14.21 11 13.75 10.5C13.75 10.87 13.5 11.25 13 11.25C12.5 11.25 12.25 10.87 12.25 10.5C12.25 9.75 11.75 9.25 11 9.25C10.25 9.25 9.75 9.75 9.75 10.5C9.75 11.81 8.69 12.87 7.38 12.87C6.06 12.87 5 11.81 5 10.5V12.5C5 14.71 6.79 16.5 9 16.5H10.5Z" />
                </svg>
              ) : (
                <svg 
                  className="w-6 h-6 text-zinc-300 drop-shadow-sm" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {/* Sad face icon */}
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="9" cy="9" r="1" fill="currentColor"/>
                  <circle cx="15" cy="9" r="1" fill="currentColor"/>
                  <path d="M8 15c1.5-2 6.5-2 8 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" transform="rotate(180 12 15)"/>
                </svg>
              )}
            </div>
          </div>
          <h3 className={`font-bold text-lg drop-shadow-sm ${
            hasStreak ? 'text-white' : 'text-zinc-300'
          }`}>
            {hasStreak ? 'Daily Streak' : 'No Streak'}
          </h3>
        </div>

        {/* Streak Number - Completely Centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center pb-9">
            {streakLoading ? (
              <div className={`text-4xl font-bold opacity-75 ${hasStreak ? 'text-white' : 'text-zinc-400'}`}>
                Loading...
              </div>
            ) : streakError ? (
              <div className={`text-4xl font-bold opacity-75 ${hasStreak ? 'text-white' : 'text-zinc-400'}`}>
                --
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className={`text-9xl font-black drop-shadow-lg tracking-tight ${
                    hasStreak ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {currentStreak}
                  </span>
                  <span className={`text-lg font-bold ${
                    hasStreak ? 'text-orange-100' : 'text-zinc-500'
                  }`}>
                    days
                  </span>
                </div>
                {!hasStreak && (
                  <div className="mt-4 flex items-center space-x-2 text-zinc-400">
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Personal Best - Bottom */}
        <div className="text-center pb-2">
          <div className={`text-s opacity-75 font-medium ${
            hasStreak ? 'text-orange-100' : 'text-zinc-400'
          }`}>
            {streakLoading ? (
              "Loading personal best..."
            ) : streakError ? (
              "Personal best: --"
            ) : longestStreak > 0 ? (
              `Personal best: ${longestStreak}`
            ) : (
              "No streak yet"
            )}
          </div>
        </div>
      </div>


      {/* Subtle animation glow */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent ${
        hasStreak 
          ? 'via-white/5 animate-pulse' 
          : 'via-zinc-400/3'
      }`} />
    </div>
  );
};

export default StreakCounter;
