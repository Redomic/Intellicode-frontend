import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon
} from '@heroicons/react/24/outline';

const SessionNavbarCounter = ({ 
  session,
  isActive,
  isPaused,
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

  const getStatusIndicator = () => {
    if (isActive) return { color: 'bg-green-400', label: 'Active' };
    if (isPaused) return { color: 'bg-amber-400', label: 'Paused' };
    return { color: 'bg-zinc-400', label: 'Inactive' };
  };

  const statusInfo = getStatusIndicator();

  return (
    <motion.div
      className={`flex items-center space-x-3 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Session Timer with Status */}
      <div className="flex items-center space-x-3 bg-zinc-800/50 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-mono font-medium text-zinc-200">
            {getDuration()}
          </span>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
          <span className="text-xs text-zinc-400">{statusInfo.label}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionNavbarCounter;
