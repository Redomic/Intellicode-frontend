import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressLoading - Progress bar with loading animation
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Loading message
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} animated - Whether to show animated stripes
 * @param {string} variant - Color variant: 'primary', 'success', 'warning', 'error'
 * @param {boolean} showPercentage - Whether to show percentage text
 * @param {string} className - Additional CSS classes
 */
const ProgressLoading = ({
  progress = 0,
  message = "Loading...",
  size = 'md',
  animated = true,
  variant = 'primary',
  showPercentage = true,
  className = ''
}) => {
  const sizeConfig = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantConfig = {
    primary: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      glow: 'shadow-green-500/50'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      glow: 'shadow-yellow-500/50'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      glow: 'shadow-red-500/50'
    }
  };

  const textSizeConfig = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className={`text-zinc-300 font-light ${textSizeConfig[size]}`}>
          {message}
        </span>
        {showPercentage && (
          <span className={`text-zinc-400 font-mono ${textSizeConfig[size]}`}>
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className={`
        w-full bg-zinc-800 rounded-full overflow-hidden ${sizeConfig[size]}
        border border-zinc-700
      `}>
        {/* Progress Bar */}
        <motion.div
          className={`
            h-full relative ${variantConfig[variant].bg}
            ${animated ? 'shadow-lg' : ''} ${variantConfig[variant].glow}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut" 
          }}
        >
          {/* Animated Stripes */}
          {animated && clampedProgress > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['0%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)'
              }}
            />
          )}

          {/* Glow Effect */}
          {clampedProgress > 0 && (
            <div className={`
              absolute inset-0 rounded-full
              ${variantConfig[variant].bg} opacity-20 blur-sm
            `} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

/**
 * StepProgress - Multi-step progress indicator
 * @param {Array} steps - Array of step objects: { label, completed, active }
 * @param {number} currentStep - Current active step index
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
const StepProgress = ({
  steps = [],
  currentStep = 0,
  size = 'md',
  className = ''
}) => {
  const sizeConfig = {
    sm: {
      circle: 'w-6 h-6 text-xs',
      text: 'text-xs',
      line: 'h-0.5'
    },
    md: {
      circle: 'w-8 h-8 text-sm',
      text: 'text-sm',
      line: 'h-1'
    },
    lg: {
      circle: 'w-10 h-10 text-base',
      text: 'text-base',
      line: 'h-1.5'
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <motion.div
              className={`
                ${sizeConfig[size].circle}
                rounded-full flex items-center justify-center font-medium
                border-2 transition-all duration-300
                ${index <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-zinc-800 border-zinc-600 text-zinc-400'
                }
              `}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: index === currentStep ? 1.1 : 1,
                backgroundColor: index <= currentStep ? '#2563eb' : '#27272a'
              }}
              transition={{ duration: 0.3 }}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>

            {/* Step Label */}
            <div className="ml-3 flex-1">
              <div className={`
                font-medium transition-colors duration-300
                ${index <= currentStep ? 'text-zinc-100' : 'text-zinc-500'}
                ${sizeConfig[size].text}
              `}>
                {step.label}
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <motion.div
                className={`
                  flex-1 mx-4 ${sizeConfig[size].line} rounded-full
                  ${index < currentStep ? 'bg-blue-600' : 'bg-zinc-700'}
                `}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index < currentStep ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProgressLoading, StepProgress };
export default ProgressLoading;

