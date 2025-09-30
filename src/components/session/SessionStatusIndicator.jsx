import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon,
  FireIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { calculateElapsedSeconds } from '../../utils/dateUtils';

const SessionStatusIndicator = ({ 
  session,
  isActive,
  isPaused,
  sessionProgress,
  liveMetrics,
  onToggleVisibility,
  compact = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time every second using UTC-aligned utilities
  useEffect(() => {
    if (!session?.startTime && !session?.start_time) return;

    const calculateElapsed = () => {
      const startTimeStr = session.startTime || session.start_time;
      // Use UTC-aligned calculation from dateUtils
      const elapsedSeconds = calculateElapsedSeconds(startTimeStr);
      setElapsed(elapsedSeconds);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session?.startTime, session?.start_time]);

  if (!session) return null;

  const getDuration = () => {
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!sessionProgress) return 0;
    return Math.min(sessionProgress.progress, 100);
  };

  const getStatusColor = () => {
    if (isActive) return 'text-green-400 bg-green-400/20';
    if (isPaused) return 'text-amber-400 bg-amber-400/20';
    return 'text-zinc-400 bg-zinc-400/20';
  };

  const getStatusText = () => {
    if (isActive) return 'Active';
    if (isPaused) return 'Paused';
    return 'Idle';
  };

  const handleToggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onToggleVisibility?.(newVisibility);
  };

  if (compact) {
    return (
      <motion.div
        className={`flex items-center space-x-3 ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor().split(' ')[2]}`}>
            {isActive && (
              <motion.div
                className="w-full h-full rounded-full bg-green-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-sm font-medium text-zinc-300">
            {getDuration()}
          </span>
        </div>

        {/* Quick Stats */}
        {liveMetrics && (
          <div className="flex items-center space-x-3 text-xs text-zinc-400">
            <span>{liveMetrics.codeChanges} changes</span>
            <span>{liveMetrics.testsRun} tests</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-zinc-800 border border-zinc-700 rounded-lg ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor()}`}>
            {isActive ? (
              <PlayIcon className="w-4 h-4" />
            ) : isPaused ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <ClockIcon className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-100">
              Coding Session
            </h3>
            <p className="text-xs text-zinc-400">
              {getStatusText()} • {getDuration()}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleVisibility}
          className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-700/50 transition-colors"
        >
          {isVisible ? (
            <EyeSlashIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      {isVisible && (
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          {sessionProgress && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-zinc-300">Progress</span>
                <span className="text-xs text-zinc-400">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>{Math.floor(sessionProgress.elapsed / (1000 * 60))}m elapsed</span>
                <span>{Math.floor(sessionProgress.remaining / (1000 * 60))}m remaining</span>
              </div>
            </div>
          )}

          {/* Live Stats */}
          {liveMetrics && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <ChartBarIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-zinc-300">Code Changes</span>
                </div>
                <div className="text-lg font-bold text-blue-400">
                  {liveMetrics.codeChanges || 0}
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <FireIcon className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium text-zinc-300">Tests Run</span>
                </div>
                <div className="text-lg font-bold text-orange-400">
                  {liveMetrics.testsRun || 0}
                </div>
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-300">Problem</span>
              <span className="text-xs text-zinc-100 font-mono truncate max-w-32">
                {session.questionTitle || 'Coding Challenge'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-300">Language</span>
              <span className="text-xs text-zinc-100 font-mono">
                {session.language || 'Python'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-300">Type</span>
              <span className="text-xs text-zinc-100 capitalize">
                {session.type?.replace('_', ' ') || 'Practice'}
              </span>
            </div>
          </div>

          {/* Analytics Summary */}
          {session.analytics && (
            <div className="pt-3 border-t border-zinc-700">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-bold text-zinc-100">
                    {session.analytics.hintsUsed || 0}
                  </div>
                  <div className="text-xs text-zinc-400">Hints</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100">
                    {session.analytics.attemptsCount || 0}
                  </div>
                  <div className="text-xs text-zinc-400">Attempts</div>
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    session.analytics.isCompleted ? 'text-green-400' : 'text-zinc-100'
                  }`}>
                    {session.analytics.isCompleted ? '✓' : '—'}
                  </div>
                  <div className="text-xs text-zinc-400">Solved</div>
                </div>
              </div>
            </div>
          )}

          {/* Live Activity Indicator */}
          {isActive && (
            <motion.div
              className="flex items-center justify-center space-x-2 py-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-green-400 font-medium">Live Session</span>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SessionStatusIndicator;

