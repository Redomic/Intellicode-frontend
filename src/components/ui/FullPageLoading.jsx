import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * FullPageLoading - Full screen loading component
 * @param {string} message - Custom loading message
 * @param {string} subtitle - Optional subtitle
 * @param {boolean} showLogo - Whether to show the IntelliCode logo
 */
const FullPageLoading = ({ 
  message = "Loading IntelliCode...", 
  subtitle = null,
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30 flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-zinc-800 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-zinc-700 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating particles */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-300/40 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + i * 5}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {showLogo && (
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-thin text-zinc-100 tracking-tight mb-2">
              IntelliCode
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
          </motion.div>
        )}

        {/* Loading Spinner */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <LoadingSpinner size="xl" variant="accent" centered />
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-zinc-300 text-lg font-light mb-2">{message}</p>
          {subtitle && (
            <p className="text-zinc-500 text-sm font-light">{subtitle}</p>
          )}
        </motion.div>

        {/* Progress Dots */}
        <motion.div 
          className="flex justify-center space-x-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-blue-400/60 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FullPageLoading;

