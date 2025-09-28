import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolid } from '@heroicons/react/24/solid';

const LevelNode = ({ 
  question, 
  isCompleted, 
  isUnlocked, 
  isCurrent, 
  onClick, 
  delay = 0 
}) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-sky-400';
      case 'medium':
        return 'bg-amber-400';
      case 'hard':
        return 'bg-rose-400';
      default:
        return 'bg-sky-400';
    }
  };

  const getDifficultyColorDarkened = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-sky-600/50';
      case 'medium':
        return 'bg-amber-600/50';
      case 'hard':
        return 'bg-rose-600/50';
      default:
        return 'bg-sky-600/50';
    }
  };

  const getDifficultyBorderDarkened = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'border-sky-500/40';
      case 'medium':
        return 'border-amber-500/40';
      case 'hard':
        return 'border-rose-500/40';
      default:
        return 'border-sky-500/40';
    }
  };

  return (
    <motion.div
      className="group flex flex-col items-center relative py-4 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Node Circle */}
      <motion.button
        onClick={onClick}
        disabled={!isUnlocked}
        className={`
          relative w-16 h-16 rounded-full border-4 flex items-center justify-center
          transition-all duration-300 z-10
          ${isCompleted 
            ? 'bg-emerald-400 border-emerald-300 shadow-lg' 
            : isCurrent 
            ? `${getDifficultyColor(question.leetcode_difficulty)} border-white shadow-xl` 
            : isUnlocked 
            ? `${getDifficultyColor(question.leetcode_difficulty)} border-white/30 hover:shadow-lg`
            : `${getDifficultyColorDarkened(question.leetcode_difficulty)} ${getDifficultyBorderDarkened(question.leetcode_difficulty)} cursor-not-allowed opacity-60`
          }
        `}
        whileHover={isUnlocked ? { scale: 1.1 } : {}}
        whileTap={isUnlocked ? { scale: 0.95 } : {}}
      >
        {/* Node Content */}
        {isCompleted ? (
          <CheckSolid className="w-8 h-8 text-white" />
        ) : !isUnlocked ? (
          <LockClosedIcon className="w-6 h-6 text-white/70" />
        ) : (
          <span className="text-white font-bold text-sm">
            {question.step_number}
          </span>
        )}

        {/* Current Level Pulse Effect */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Level Title */}
      <motion.div 
        className="mt-2 text-center max-w-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        <div className="text-xs text-zinc-300 font-medium line-clamp-2">
          {question.leetcode_title || question.original_title}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          {question.leetcode_difficulty}
        </div>
      </motion.div>

      {/* Detailed Hover Tooltip */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 pointer-events-none z-50"
      >
        <div className="bg-zinc-800/95 backdrop-blur-xl border border-zinc-600/50 rounded-xl p-4 shadow-2xl min-w-80 max-w-96">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-semibold text-white text-sm leading-tight mb-1">
              {question.leetcode_title || question.original_title}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`
                px-2 py-1 rounded-full font-medium
                ${question.leetcode_difficulty?.toLowerCase() === 'easy' ? 'bg-sky-500/20 text-sky-300' :
                  question.leetcode_difficulty?.toLowerCase() === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                  question.leetcode_difficulty?.toLowerCase() === 'hard' ? 'bg-rose-500/20 text-rose-300' :
                  'bg-sky-500/20 text-sky-300'
                }
              `}>
                {question.leetcode_difficulty || 'Practice'}
              </span>
              <span className="text-zinc-400">Step {question.step_number}</span>
              {question.a2z_difficulty && (
                <span className="text-zinc-400">• A2Z Level {question.a2z_difficulty}</span>
              )}
            </div>
          </div>

          {/* Problem Info */}
          {question.a2z_step && (
            <div className="mb-3">
              <div className="text-xs text-zinc-400 mb-1">Category</div>
              <div className="text-sm text-zinc-300">{question.a2z_step}</div>
              {question.a2z_sub_step && (
                <div className="text-xs text-zinc-400 mt-1">• {question.a2z_sub_step}</div>
              )}
            </div>
          )}

          {/* Topics */}
          {question.topics && question.topics.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-zinc-400 mb-2">Topics</div>
              <div className="flex flex-wrap gap-1">
                {question.topics.slice(0, 4).map((topic, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-md border border-blue-500/20"
                  >
                    {topic}
                  </span>
                ))}
                {question.topics.length > 4 && (
                  <span className="text-xs text-zinc-500 px-2 py-1">
                    +{question.topics.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs border-t border-zinc-700/50 pt-3">
            <div className="flex items-center gap-4">
              {question.examples && question.examples.length > 0 && (
                <div className="flex items-center gap-1 text-zinc-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{question.examples.length} examples</span>
                </div>
              )}
              
              {question.hints && question.hints.length > 0 && (
                <div className="flex items-center gap-1 text-zinc-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{question.hints.length} hints</span>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1">
              {isCompleted ? (
                <div className="flex items-center gap-1 text-emerald-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-xs">Completed</span>
                </div>
              ) : !isUnlocked ? (
                <div className="flex items-center gap-1 text-zinc-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-xs">Locked</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sky-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs">Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Tags */}
          {question.company_tags && question.company_tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-700/50">
              <div className="text-xs text-zinc-400 mb-2">Asked by</div>
              <div className="flex flex-wrap gap-1">
                {question.company_tags.slice(0, 3).map((company, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-md border border-purple-500/20"
                  >
                    {company}
                  </span>
                ))}
                {question.company_tags.length > 3 && (
                  <span className="text-xs text-zinc-500 px-2 py-1">
                    +{question.company_tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Tooltip Arrow */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-zinc-800/95 border-l border-t border-zinc-600/50 rotate-45"></div>
      </div>
    </motion.div>
  );
};

export default LevelNode;
