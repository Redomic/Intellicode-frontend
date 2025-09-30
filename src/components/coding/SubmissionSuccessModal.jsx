import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantOrb from '../ui/AIAssistantOrb';
import { LoadingButton } from '../ui/InlineLoading';

/**
 * SubmissionSuccessModal - Shows after successful submission
 * Matches design language of FullscreenExitModal
 */
const SubmissionSuccessModal = ({ 
  isVisible, 
  onContinue, 
  onEndSession,
  questionTitle,
  runtime,
  runtimePercentile,
  memoryKb,
  memoryPercentile
}) => {
  // Handle ESC key to continue
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onContinue();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
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
          className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-green-950/30 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
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
                {/* Success Badge */}
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="text-xl font-medium text-zinc-100 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Submission Accepted
            </motion.h2>
            
            <motion.p
              className="text-zinc-400 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              All test cases passed successfully
            </motion.p>
          </div>

          {/* Content */}
          <div className="relative p-6">
            {/* Session Info */}
            <motion.div
              className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="text-xs text-zinc-500 mb-2">Problem Solved</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Problem:</span>
                  <span className="text-zinc-200 text-sm font-medium">
                    {questionTitle || 'Coding Challenge'}
                  </span>
                </div>
                
                {/* Performance Metrics */}
                {runtime && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Runtime:</span>
                    <span className="text-zinc-200 text-sm font-mono">
                      {runtime}ms
                      {runtimePercentile && (
                        <span className="text-zinc-500 ml-1">
                          ({runtimePercentile.toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {memoryKb && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Memory:</span>
                    <span className="text-zinc-200 text-sm font-mono">
                      {(memoryKb / 1024).toFixed(1)}MB
                      {memoryPercentile && (
                        <span className="text-zinc-500 ml-1">
                          ({memoryPercentile.toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Options */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <p className="text-zinc-300 text-sm">
                Continue practicing or end your session?
              </p>
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
                variant="primary"
                size="md"
                className="flex-1"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Continue Coding</span>
                </div>
              </LoadingButton>
              
              <LoadingButton
                onClick={onEndSession}
                variant="secondary"
                size="md"
                className="flex-1"
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
                Press <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">Esc</kbd> to continue coding
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubmissionSuccessModal;
