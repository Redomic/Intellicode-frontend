import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/userSlice';
import useAuth from '../../hooks/useAuth';
import { 
  XMarkIcon,
  SparklesIcon,
  CpuChipIcon,
  CodeBracketSquareIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const DemoRestrictionModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const user = useSelector(selectCurrentUser);
  const { logout } = useAuth();

  // Limits
  const QUESTION_LIMIT = 3;
  const AI_LIMIT = 20;

  // Check if limits reached
  const questionsUsed = user?.interacted_questions?.length || 0;
  const aiCallsUsed = user?.llm_usage_count || 0;
  const isLimitReached = questionsUsed >= QUESTION_LIMIT || aiCallsUsed >= AI_LIMIT;

  // Re-open modal if limit reached, preventing close
  useEffect(() => {
    if (isLimitReached && !isOpen) {
      setIsOpen(true);
    }
  }, [isLimitReached, isOpen]);

  // Poll user data to check limits in real-time
  useEffect(() => {
    // Only poll if the drawer isn't already polling (drawer is present in global layout)
    // The DemoUsageDrawer handles the polling now to avoid duplication.
    // This effect is left empty or can be removed if we are confident the drawer is always mounted.
    // For safety, we rely on the global user state updates from the drawer.
  }, [user, isLimitReached]);

  const handleDismiss = () => {
    if (!isLimitReached) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop with Blur - prevents interaction if limit reached */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-md ${isLimitReached ? 'cursor-not-allowed' : ''}`}
          onClick={handleDismiss} 
        />
        
          {/* Modal Content */}
        <motion.div
          className={`
            relative w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border 
            ${isLimitReached ? 'border-zinc-700' : 'border-white/10'}
          `}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="relative p-8 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                IntelliCode <span className="text-blue-400 font-normal">Beta</span>
              </h3>
              <p className={`text-sm font-medium uppercase tracking-wider mt-1 ${isLimitReached ? 'text-red-400' : 'text-zinc-400'}`}>
                {isLimitReached ? "Demo Limit Reached" : "Research Preview"}
              </p>
            </div>
            
            {!isLimitReached && (
              <button
                onClick={handleDismiss}
                className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-8 py- space-y-8 relative z-10">
            {isLimitReached ? (
              <p className="text-zinc-300 leading-relaxed text-base">
                Thank you for participating in the IntelliCode research preview. You have reached the limit for this demo account.
                <br/><br/>
                To ensure fair usage and manage research costs, we've paused further interactions on this account.
              </p>
            ) : (
              <p className="text-zinc-300 leading-relaxed text-base">
                Welcome to <span className="text-white font-medium">IntelliCode</span>. 
                This is a demonstration version designed to evaluate our intelligent tutoring system. All registered users are currently in beta mode.
              </p>
            )}
            
            <div className="space-y-4 pb-8">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {isLimitReached ? "Your Usage" : "Beta Account Limits"}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Limit Card 1 */}
                <div className={`
                  group p-5 rounded-2xl bg-white/5 border transition-all duration-300
                  ${questionsUsed >= QUESTION_LIMIT ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5'}
                `}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`
                      p-2.5 rounded-xl transition-colors
                      ${questionsUsed >= QUESTION_LIMIT ? 'bg-red-900/50 text-red-200' : 'bg-zinc-800 text-blue-400 group-hover:text-blue-300'}
                    `}>
                      <CodeBracketSquareIcon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-bold text-white">{questionsUsed}</span>
                    <span className="text-zinc-500 text-sm self-end mb-1">/ {QUESTION_LIMIT}</span>
                  </div>
                  <div className="text-base text-zinc-300 font-medium">Interactive Questions</div>
                  {isLimitReached && questionsUsed >= QUESTION_LIMIT && (
                    <div className="text-xs text-red-400 mt-1 font-medium">Limit Reached</div>
                  )}
                </div>

                {/* Limit Card 2 */}
                <div className={`
                  group p-5 rounded-2xl bg-white/5 border transition-all duration-300
                  ${aiCallsUsed >= AI_LIMIT ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5'}
                `}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`
                      p-2.5 rounded-xl transition-colors
                      ${aiCallsUsed >= AI_LIMIT ? 'bg-red-900/50 text-red-200' : 'bg-zinc-800 text-indigo-400 group-hover:text-indigo-300'}
                    `}>
                      <CpuChipIcon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-bold text-white">{aiCallsUsed}</span>
                    <span className="text-zinc-500 text-sm self-end mb-1">/ {AI_LIMIT}</span>
                  </div>
                  <div className="text-base text-zinc-300 font-medium">AI Assistant Calls</div>
                  {isLimitReached && aiCallsUsed >= AI_LIMIT && (
                    <div className="text-xs text-red-400 mt-1 font-medium">Limit Reached</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {isLimitReached ? (
            <div className="p-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={logout}
                className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-red-500/20 w-full sm:w-auto min-w-[140px] gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
          </div>
        ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoRestrictionModal;
