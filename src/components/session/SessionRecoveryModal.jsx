import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  CodeBracketIcon, 
  PlayIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SessionRecoveryModal = ({ 
  isOpen, 
  recoveryData, 
  onRecover, 
  onDismiss, 
  isRecovering = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !recoveryData) return null;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTimePausedText = () => {
    const { timePaused } = recoveryData;
    
    if (timePaused < 60) {
      return 'Just now';
    } else if (timePaused < 3600) {
      const minutes = Math.floor(timePaused / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timePaused < 86400) {
      const hours = Math.floor(timePaused / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(timePaused / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative w-full max-w-lg mx-4 bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Session Recovery
                </h3>
                <p className="text-sm text-zinc-400">
                  Found an interrupted session
                </p>
              </div>
            </div>
            
            <button
              onClick={onDismiss}
              className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-700/50 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Session Info */}
            <div className="bg-zinc-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Problem</span>
                <span className="text-sm text-zinc-100 font-mono">
                  {recoveryData.questionTitle || 'Coding Challenge'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Last Active</span>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-100">
                    {getTimePausedText()}
                  </span>
                </div>
              </div>

              {recoveryData.analytics && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {recoveryData.analytics.codeChanges || 0}
                    </div>
                    <div className="text-xs text-zinc-400">Code Changes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {recoveryData.analytics.testsRun || 0}
                    </div>
                    <div className="text-xs text-zinc-400">Tests Run</div>
                  </div>
                </div>
              )}
            </div>

            {/* Code Preview */}
            {recoveryData.lastCode && (
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full p-3 bg-zinc-900/30 rounded-lg hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <CodeBracketIcon className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-300">
                      Last Code Snapshot
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-400">
                            {recoveryData.lastCode.language}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {recoveryData.lastCode.length} characters
                          </span>
                        </div>
                        <pre className="text-xs text-zinc-300 font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {recoveryData.lastCode.code.slice(0, 200)}
                          {recoveryData.lastCode.code.length > 200 && '...'}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start space-x-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-200 font-medium mb-1">
                  Session Data Available
                </p>
                <p className="text-xs text-amber-300/80">
                  Your previous work can be restored. Choose to continue where you left off 
                  or start fresh with a new session.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-zinc-700">
            <button
              onClick={onDismiss}
              disabled={isRecovering}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 
                       bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Fresh
            </button>
            
            <button
              onClick={onRecover}
              disabled={isRecovering}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium 
                       text-white bg-blue-600 hover:bg-blue-700 rounded-lg 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecovering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Recovering...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Continue Session</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionRecoveryModal;
