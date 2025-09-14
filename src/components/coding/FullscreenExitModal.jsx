import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantOrb from '../ui/AIAssistantOrb';
import { LoadingButton } from '../ui/InlineLoading';

/**
 * FullscreenExitModal - Modal that appears when user exits fullscreen during focused session
 * Provides options to continue or end the session
 */
const FullscreenExitModal = ({ 
  isVisible, 
  onContinue, 
  onEndSession, 
  sessionInfo = null 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isAutoReturning, setIsAutoReturning] = useState(false);

  // Auto-return countdown
  useEffect(() => {
    if (!isVisible) {
      setTimeRemaining(10);
      setIsAutoReturning(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setIsAutoReturning(true);
          setTimeout(() => {
            onContinue();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onContinue]);

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
          className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
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
                <AIAssistantOrb size="xl" isActive={true} />
                
              </div>
            </motion.div>

            <motion.h2
              className="text-xl font-medium text-zinc-100 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Focus Mode Interrupted
            </motion.h2>
            
            <motion.p
              className="text-zinc-400 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              You've exited fullscreen during your focused coding session
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

            {/* Options */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <p className="text-zinc-300 text-sm mb-2">
                Stay focused and return to fullscreen, or end this session?
              </p>
              
              {/* Auto-return countdown */}
              {!isAutoReturning ? (
                <div className="flex items-center justify-center space-x-2 text-xs text-zinc-500">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span>Auto-returning to fullscreen in {timeRemaining}s</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-xs text-orange-400">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span>Returning to focus mode...</span>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex space-x-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <LoadingButton
                onClick={onContinue}
                isLoading={isAutoReturning}
                loadingText="Returning..."
                variant="primary"
                size="md"
                className="flex-1"
                disabled={isAutoReturning}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span>Continue Focused</span>
                </div>
              </LoadingButton>
              
              <LoadingButton
                onClick={onEndSession}
                variant="secondary"
                size="md"
                className="flex-1"
                disabled={isAutoReturning}
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
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <p className="text-xs text-zinc-500">
                💡 Tip: Press <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">F11</kbd> or{' '}
                <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">Esc</kbd> to toggle fullscreen
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullscreenExitModal;

