import React from 'react';
import { motion } from 'framer-motion';

/**
 * OptimizationTips - Displays code quality suggestions from the Code Analysis Agent
 * 
 * Parses structured analysis and displays with beautiful styling:
 * - Time complexity improvements
 * - Space complexity optimizations
 * - Readability enhancements
 * - Edge case considerations
 */

/**
 * Parse structured analysis text from backend.
 * 
 * Expected format from backend:
 *   SUCCESS_MESSAGE: Message here
 *   
 *   SUGGESTION|TYPE|Line X|Title|Explanation
 *   SUGGESTION|TYPE|Line Y|Title|Explanation
 *   
 *   OVERALL: Assessment here
 * 
 * Or for optimal code:
 *   SUCCESS_MESSAGE: Message here
 *   
 *   NO_SUGGESTIONS: Reason why code is already optimal
 *   
 *   OVERALL: Assessment here
 * 
 * Handles edge cases gracefully:
 * - Missing components (provides defaults)
 * - Malformed suggestions (skips them)
 * - NO_SUGGESTIONS case (code is already optimal)
 * - Empty responses (returns minimal valid structure)
 */
const parseAnalysis = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      successMessage: 'Your code passed all tests!',
      suggestions: [],
      noSuggestionsReason: null,
      overall: 'Great work on completing this problem!'
    };
  }

  const lines = text.split('\n').filter(line => line.trim());
  
  const parsed = {
    successMessage: '',
    suggestions: [],
    noSuggestionsReason: null,  // New field for optimal code
    overall: ''
  };
  
  lines.forEach(line => {
    // Parse SUCCESS_MESSAGE
    if (line.startsWith('SUCCESS_MESSAGE:')) {
      parsed.successMessage = line.replace('SUCCESS_MESSAGE:', '').trim();
    }
    // Parse NO_SUGGESTIONS (code is already optimal)
    else if (line.startsWith('NO_SUGGESTIONS:')) {
      parsed.noSuggestionsReason = line.replace('NO_SUGGESTIONS:', '').trim();
    }
    // Parse SUGGESTION (pipe-delimited)
    else if (line.startsWith('SUGGESTION|')) {
      const parts = line.replace('SUGGESTION|', '').split('|');
      
      // Ensure we have all required fields
      if (parts.length >= 4) {
        const type = parts[0].trim();
        const lineRef = parts[1].trim();
        const title = parts[2].trim();
        // Join remaining parts in case explanation contains pipes
        const explanation = parts.slice(3).join('|').trim();
        
        // Validate suggestion type
        const validTypes = ['TIME', 'SPACE', 'READABILITY', 'EDGE_CASE'];
        if (validTypes.includes(type) && title && explanation) {
          parsed.suggestions.push({
            type,
            line: lineRef,
            title,
            explanation
          });
        }
      }
    } 
    // Parse OVERALL
    else if (line.startsWith('OVERALL:')) {
      parsed.overall = line.replace('OVERALL:', '').trim();
    }
  });
  
  // Provide defaults if components are missing
  if (!parsed.successMessage) {
    parsed.successMessage = 'Your code passed all tests!';
  }
  
  if (!parsed.overall) {
    parsed.overall = 'Great work on completing this problem!';
  }
  
  return parsed;
};

// Get icon and color for suggestion type
const getSuggestionStyle = (type) => {
  const styles = {
    TIME: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      label: 'Time Complexity'
    },
    SPACE: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      label: 'Space Complexity'
    },
    READABILITY: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      label: 'Code Quality'
    },
    EDGE_CASE: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      label: 'Edge Cases'
    }
  };
  
  return styles[type] || styles.READABILITY;
};

const OptimizationTips = ({ analysisData }) => {
  // Handle missing or invalid data gracefully
  if (!analysisData || !analysisData.analysis_text) {
    return null;
  }

  const { analysis_text, proficiency_level } = analysisData;
  const parsed = parseAnalysis(analysis_text);

  // If there's a NO_SUGGESTIONS reason, show "Already Optimal" card
  if (parsed.noSuggestionsReason) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-zinc-900 to-zinc-950 rounded-xl border border-emerald-500/30 shadow-xl mb-6"
      >
        {/* Celebratory gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
        
        <div className="relative p-6">
          {/* Header with celebration icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 shadow-lg">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-400 tracking-tight">
                Already Optimized!
              </h3>
              {proficiency_level && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Analyzed at {proficiency_level} Level
                </p>
              )}
            </div>
          </div>

          {/* Success banner */}
          {parsed.successMessage && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 mb-4">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-emerald-300">
                {parsed.successMessage}
              </p>
            </div>
          )}

          {/* No suggestions reason */}
          <div className="p-5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 mb-4">
            <p className="text-sm text-zinc-300 leading-relaxed">
              {parsed.noSuggestionsReason}
            </p>
          </div>

          {/* Overall assessment */}
          {parsed.overall && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-zinc-800/30 to-zinc-800/20 border border-emerald-500/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Assessment
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {parsed.overall}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Don't render if we have no suggestions and no reason (error case)
  if (parsed.suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 shadow-xl mb-6"
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            {/* Analysis Icon */}
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 shadow-sm">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
                Code Insights from Your AI Mentor
              </h3>
              {proficiency_level && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-zinc-600">•</span>
                  <span className="text-xs text-zinc-500 font-medium">
                    Tailored for {proficiency_level} Level
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Insight Count Badge */}
          <div className="px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 shadow-sm">
            <span className="text-xs font-semibold text-zinc-300 tracking-wide">
              {parsed.suggestions.length} {parsed.suggestions.length === 1 ? 'Insight' : 'Insights'}
            </span>
          </div>
        </div>

        {/* Elegant Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-6"></div>

        {/* Suggestions Container */}
        <div className="p-6 space-y-4">
          {/* Success Message Banner (if present) */}
          {parsed.successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
            >
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-emerald-300">
                {parsed.successMessage}
              </p>
            </motion.div>
          )}

          {/* Suggestions List */}
          <div className="space-y-3">
            {parsed.suggestions.map((suggestion, index) => {
              const style = getSuggestionStyle(suggestion.type);
              
              return (
                <motion.div
                  key={`${suggestion.type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.1 * index, 
                    type: "spring", 
                    stiffness: 100,
                    damping: 15
                  }}
                  className="group relative"
                >
                  {/* Suggestion Card */}
                  <div className={`relative overflow-hidden rounded-lg border ${style.borderColor} bg-zinc-800/40 backdrop-blur-sm hover:bg-zinc-800/60 hover:shadow-lg transition-all duration-300`}>
                    {/* Subtle gradient background */}
                    <div className={`absolute inset-0 ${style.bgColor} opacity-30 group-hover:opacity-40 transition-opacity duration-300`}></div>
                    
                    {/* Card Content */}
                    <div className="relative p-4 flex items-start gap-4">
                      {/* Category Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.bgColor} border ${style.borderColor} flex items-center justify-center ${style.textColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        {style.icon}
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Type Badge and Line Reference */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${style.textColor} ${style.bgColor} border ${style.borderColor} uppercase tracking-wider`}>
                            {style.label}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-700/50">
                            {suggestion.line}
                          </span>
                        </div>
                        
                        {/* Suggestion Title */}
                        <h5 className="text-sm font-semibold text-zinc-100 leading-snug tracking-tight">
                          {suggestion.title}
                        </h5>
                        
                        {/* Detailed Explanation */}
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {suggestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Overall Assessment Section */}
          {parsed.overall && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (parsed.suggestions.length * 0.1), duration: 0.4 }}
              className="mt-6 pt-4 border-t border-zinc-800/50"
            >
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-zinc-800/30 to-zinc-800/20 border border-zinc-700/30 hover:border-zinc-700/50 transition-colors duration-300">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                    Overall Assessment
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {parsed.overall}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OptimizationTips;

