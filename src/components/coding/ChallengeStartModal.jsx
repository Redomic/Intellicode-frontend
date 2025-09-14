import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantOrb from '../ui/AIAssistantOrb';

/**
 * ChallengeStartModal - Professional modal for starting coding challenges
 * Clean, modern design with automatic fullscreen activation
 */
const ChallengeStartModal = ({ isOpen, onClose, onStartChallenge, challengeTitle = "Daily Challenge" }) => {
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState('30min');

  useEffect(() => {
    // Check if fullscreen API is supported
    setIsFullscreenSupported(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }, []);

  const handleStartChallenge = async () => {
    if (!agreedToTerms) {
      return;
    }

    try {
      // Automatically enter fullscreen mode
      if (isFullscreenSupported) {
        const docElement = document.documentElement;
        if (docElement.requestFullscreen) {
          await docElement.requestFullscreen();
        } else if (docElement.webkitRequestFullscreen) {
          await docElement.webkitRequestFullscreen();
        } else if (docElement.mozRequestFullScreen) {
          await docElement.mozRequestFullScreen();
        } else if (docElement.msRequestFullscreen) {
          await docElement.msRequestFullscreen();
        }
      }

      // Start the challenge with tracking metadata
      onStartChallenge({
        startTime: new Date().toISOString(),
        sessionType: 'DAILY_CHALLENGE',
        fullscreenActivated: isFullscreenSupported,
        timeCommitment: selectedTimeCommitment,
        userAgreements: {
          noCheating: true,
          privacyConsent: true,
        },
      });

      onClose();
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error);
      // Still start the challenge even if fullscreen fails
      onStartChallenge({
        startTime: new Date().toISOString(),
        sessionType: 'DAILY_CHALLENGE',
        fullscreenActivated: false,
        timeCommitment: selectedTimeCommitment,
        userAgreements: {
          noCheating: true,
          privacyConsent: true,
        },
      });
      onClose();
    }
  };

  const timeOptions = [
    { value: '15min', label: '15 minutes', desc: 'Quick practice' },
    { value: '30min', label: '30 minutes', desc: 'Standard session' },
    { value: '45min', label: '45 minutes', desc: 'Extended practice' },
    { value: '60min', label: '1 hour', desc: 'Deep focus' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative max-w-md w-full mx-4 bg-zinc-900/95 border border-zinc-700/50 rounded-2xl shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="text-center pt-8 pb-6 px-8">
            <div className="flex justify-center mb-4">
              <AIAssistantOrb size="lg" isActive={true} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready to code?
            </h2>
            <p className="text-zinc-400 text-sm">
              Your coding session will be intelligently tracked and analyzed. Be in a distraction-free enviroment
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 space-y-6">
            {/* Time Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-300">Session Duration</h3>
              <div className="grid grid-cols-2 gap-2">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTimeCommitment(option.value)}
                    className={`
                      p-3 rounded-lg border transition-all duration-200 text-left
                      ${selectedTimeCommitment === option.value
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                      }
                    `}
                  >
                    <div className="text-sm font-medium text-white">{option.label}</div>
                    <div className="text-xs text-zinc-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer group p-4 rounded-lg border border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-orange-500 bg-zinc-700 border-zinc-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <div className="text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors">
                  <p className="font-medium">I consent to AI behavior tracking</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Allow the AI assistant to monitor my coding patterns and provide insights
                  </p>
                </div>
              </label>
            </div>


            {/* Fullscreen Notice */}
            {isFullscreenSupported && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <p className="text-xs text-blue-300">
                    Automatic fullscreen mode for distraction-free coding
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg border border-zinc-700 hover:border-zinc-600"
              >
                Cancel
              </button>
              
              <button
                onClick={handleStartChallenge}
                disabled={!agreedToTerms}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform
                  ${agreedToTerms
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/25 hover:scale-105'
                    : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  }
                `}
              >
                Begin Session
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChallengeStartModal;
