import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon
} from '@heroicons/react/24/outline';
import { calculateElapsedSeconds } from '../../utils/dateUtils';

const SessionNavbarCounter = ({ 
  session,
  isActive,
  isPaused,
  className = ''
}) => {
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time every second using UTC-aligned utilities
  useEffect(() => {
    if (!session?.startTime && !session?.start_time) {
      console.warn('⚠️ Timer: No startTime found in session:', {
        hasSession: !!session,
        sessionKeys: session ? Object.keys(session) : [],
        startTime: session?.startTime,
        start_time: session?.start_time
      });
      return;
    }

    const calculateElapsed = () => {
      // Try both camelCase and snake_case
      const startTimeStr = session.startTime || session.start_time;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('⏱️ Timer calculating (UTC):', {
          startTimeStr,
          type: typeof startTimeStr,
          nowUTC: new Date().toISOString()
        });
      }
      
      // Use UTC-aligned calculation from dateUtils
      const elapsedSeconds = calculateElapsedSeconds(startTimeStr);
      setElapsed(elapsedSeconds);
    };

    // Calculate immediately
    calculateElapsed();

    // Then update every second
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session?.startTime, session?.start_time]);

  if (!session) return null;

  // Format elapsed time as MM:SS
  const getDuration = () => {
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
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
