import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, setCurrentUser } from '../../store/userSlice';
import api from '../../utils/axios';
import { 
  ChevronUpIcon, 
  CodeBracketSquareIcon, 
  CpuChipIcon 
} from '@heroicons/react/24/outline';

const DemoUsageDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

  // Poll for user data updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          dispatch(setCurrentUser(response.data));
        }
      } catch (error) {
        console.error('Failed to update user usage data:', error);
      }
    };

    // Initial fetch
    fetchUserData();

    // Poll every 5 seconds
    const intervalId = setInterval(fetchUserData, 5000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, dispatch]);

  // Only show if user is authenticated
  if (!isAuthenticated) return null;

  // Default values if user is not loaded
  const questionsUsed = user?.interacted_questions?.length || 0;
  const aiCallsUsed = user?.llm_usage_count || 0;
  
  // Limits
  const QUESTION_LIMIT = 3;
  const AI_LIMIT = 20;

  // Calculate percentages for progress bars
  const questionPercent = Math.min((questionsUsed / QUESTION_LIMIT) * 100, 100);
  const aiPercent = Math.min((aiCallsUsed / AI_LIMIT) * 100, 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] flex justify-center pointer-events-none">
      <div className="relative pointer-events-auto">
        
        {/* Tab / Handle */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute bottom-full left-1/2 -translate-x-1/2 bg-zinc-800 border-t border-x border-zinc-700 rounded-t-xl px-6 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-700 transition-colors shadow-lg"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Demo Usage</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronUpIcon className="w-3.5 h-3.5 text-zinc-400" />
          </motion.div>
        </motion.button>

        {/* Drawer Content */}
        <motion.div
          initial={false}
          animate={{ 
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-zinc-900 border-t border-zinc-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden w-[90vw] max-w-2xl rounded-t-xl mx-auto"
        >
          <div className="p-6 grid grid-cols-2 gap-8">
            
            {/* Questions Stat */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CodeBracketSquareIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Questions</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {questionsUsed} <span className="text-zinc-500 font-normal">/ {QUESTION_LIMIT}</span>
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${questionPercent >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${questionPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-zinc-500">Interactive coding problems attempted</p>
            </div>

            {/* AI Calls Stat */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CpuChipIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {aiCallsUsed} <span className="text-zinc-500 font-normal">/ {AI_LIMIT}</span>
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${aiPercent >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${aiPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-zinc-500">Smart hints and code analysis calls</p>
            </div>

          </div>
          
          {/* Footer Info */}
          <div className="px-6 py-2 bg-zinc-950/50 border-t border-zinc-800 flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Research Preview Beta
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-zinc-700" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoUsageDrawer;

