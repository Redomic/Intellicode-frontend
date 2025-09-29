import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantOrb from '../ui/AIAssistantOrb';
import { LoadingButton } from '../ui/InlineLoading';

/**
 * PauseSessionModal - Modal that appears when user pauses a coding session
 * Provides options to resume or end the session
 */
const PauseSessionModal = ({ 
  isVisible, 
  onResume, 
  onEndSession, 
  sessionInfo = null,
  isPausing = false,
  isResuming = false 
}) => {
  const [autoEndCountdown, setAutoEndCountdown] = useState(600); // 10 minutes

  // Auto-end countdown when session is paused
  useEffect(() => {
    if (!isVisible) {
      setAutoEndCountdown(600); // Reset to 10 minutes
      return;
    }

    const interval = setInterval(() => {
      setAutoEndCountdown(prev => {
        if (prev <= 0) {
          // Auto-end session after 10 minutes of being paused
          onEndSession('auto_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onEndSession]);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl" />
          </div>

          {/* Header with AI Orb */}
          <div className="relative p-6 text-center border-b border-zinc-700/50">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <AIAssistantOrb size="xl" isActive={false} />
                {/* Pause indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="text-xl font-medium text-zinc-100 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Session Paused
            </motion.h2>
            
            <motion.p
              className="text-zinc-400 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Your coding session is temporarily on hold
            </motion.p>
          </div>

          {/* Content */}
          <div className="relative p-6">
            {/* Session Info */}
            {sessionInfo && (
              <motion.div
                className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="text-xs text-zinc-500 mb-2">Current Session</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Problem:</span>
                    <span className="text-zinc-200 text-sm font-medium">
                      {sessionInfo.problemTitle || 'Coding Challenge'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Time Elapsed:</span>
                    <span className="text-zinc-200 text-sm font-mono">
                      {sessionInfo.timeElapsed || '00:00'}
                    </span>
                  </div>
                  {sessionInfo.language && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Language:</span>
                      <span className="text-zinc-200 text-sm">
                        {sessionInfo.language}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Auto-end warning */}
            <motion.div
              className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 text-amber-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Session will auto-end in: {formatCountdown(autoEndCountdown)}</span>
              </div>
            </motion.div>

            {/* Options */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <p className="text-zinc-300 text-sm mb-2">
                Take a break or continue where you left off
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex space-x-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <LoadingButton
                onClick={() => {
                  console.log('🎬 Resume button clicked in modal');
                  onResume();
                }}
                isLoading={isResuming}
                loadingText="Resuming..."
                variant="primary"
                size="md"
                className="flex-1"
                disabled={isPausing || isResuming}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Resume Session</span>
                </div>
              </LoadingButton>
              
              <LoadingButton
                onClick={() => {
                  console.log('🛑 End session button clicked in modal');
                  onEndSession('user_request');
                }}
                variant="secondary"
                size="md"
                className="flex-1"
                disabled={isPausing || isResuming}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>End Session</span>
                </div>
              </LoadingButton>
            </motion.div>

            {/* Helper Text */}
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <p className="text-xs text-zinc-500">
                💡 Your progress is automatically saved
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PauseSessionModal;
