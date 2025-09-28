import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const SessionNavbarCounter = ({ 
  session,
  isActive,
  isPaused,
  onPause,
  onResume,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every second for live duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!session) return null;

  const getDuration = () => {
    const startTime = new Date(session.startTime).getTime();
    const elapsed = currentTime - startTime;
    const minutes = Math.floor(elapsed / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleToggleSession = () => {
    if (isActive) {
      onPause?.();
    } else if (isPaused) {
      onResume?.();
    }
  };

  const getStatusColor = () => {
    if (isActive) return 'text-green-400 bg-green-400/20';
    if (isPaused) return 'text-amber-400 bg-amber-400/20';
    return 'text-zinc-400 bg-zinc-400/20';
  };

  return (
    <motion.div
      className={`flex items-center space-x-3 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Session Timer */}
      <div className="flex items-center space-x-2 bg-zinc-800/50 rounded-lg px-3 py-2">
        <ClockIcon className="w-4 h-4 text-zinc-400" />
        <span className="text-sm font-mono font-medium text-zinc-200">
          {getDuration()}
        </span>
      </div>

      {/* Pause/Resume Button */}
      <button
        onClick={handleToggleSession}
        disabled={!isActive && !isPaused}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
          ${getStatusColor()}
          hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isActive ? 'Pause Session' : isPaused ? 'Resume Session' : 'No Active Session'}
      >
        {isActive ? (
          <PauseIcon className="w-4 h-4" />
        ) : (
          <PlayIcon className="w-4 h-4 ml-0.5" />
        )}
      </button>
    </motion.div>
  );
};

export default SessionNavbarCounter;
