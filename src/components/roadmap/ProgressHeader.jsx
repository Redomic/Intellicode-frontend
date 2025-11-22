import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { TrophyIcon as TrophySolid, FireIcon as FireSolid } from '@heroicons/react/24/solid';

const ProgressHeader = ({ totalLevels, completedLevels, courseName }) => {
  const progressPercentage = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  const streak = 3; // Mock streak data
  const perfectSolves = Math.floor(completedLevels * 0.7); // Mock perfect solves
  
  return (
    <motion.div 
      className="relative px-6 py-8 border-b border-zinc-800/30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Main Progress Section */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block p-6 bg-gradient-to-br from-zinc-800/40 to-zinc-900/20 backdrop-blur-sm border border-zinc-700/30 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                {/* Background Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-zinc-700/50"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="text-blue-500"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 56}`,
                  }}
                  initial={{ strokeDashoffset: `${2 * Math.PI * 56}` }}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 56 * (1 - progressPercentage / 100)}` }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                />
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div 
                    className="text-2xl font-bold text-white mb-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
                  >
                    {Math.round(progressPercentage)}%
                  </motion.div>
                  <div className="text-xs text-zinc-400 font-medium">Complete</div>
                </div>
              </div>
              
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg opacity-50" />
            </div>
            
            {/* Progress Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-xl font-bold text-white mb-2">
                {completedLevels} of {totalLevels} Challenges
              </h2>
              <p className="text-zinc-400 text-sm">
                Keep going! You're making great progress
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Streak Card */}
          <motion.div 
            className="group bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-400/20 rounded-xl p-4 hover:border-orange-400/40 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FireSolid className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{streak}</div>
                <div className="text-xs text-zinc-400 font-medium">Day Streak</div>
              </div>
            </div>
            <div className="text-xs text-orange-300/80">
              🔥 Keep the momentum going!
            </div>
          </motion.div>

          {/* Perfect Solves Card */}
          <motion.div 
            className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-400/20 rounded-xl p-4 hover:border-green-400/40 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrophySolid className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{perfectSolves}</div>
                <div className="text-xs text-zinc-400 font-medium">Perfect Solves</div>
              </div>
            </div>
            <div className="text-xs text-green-300/80">
              ⭐ Excellent problem solving!
            </div>
          </motion.div>

          {/* Difficulty Card */}
          <motion.div 
            className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 hover:border-blue-400/40 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">
                  {completedLevels > 0 ? 'Mixed' : '-'}
                </div>
                <div className="text-xs text-zinc-400 font-medium">Difficulty</div>
              </div>
            </div>
            <div className="text-xs text-blue-300/80">
              💪 Challenging yourself!
            </div>
          </motion.div>
        </motion.div>

        {/* Achievement Banner (conditionally shown) */}
        {progressPercentage >= 25 && progressPercentage < 30 && (
          <motion.div
            className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-400/30 rounded-xl text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 1 }}
          >
            <div className="flex items-center justify-center gap-2 text-purple-300 mb-1">
              <TrophySolid className="w-5 h-5" />
              <span className="font-bold">Achievement Unlocked!</span>
            </div>
            <p className="text-sm text-purple-200">
              Quarter Master - You've completed 25% of the course!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressHeader;
