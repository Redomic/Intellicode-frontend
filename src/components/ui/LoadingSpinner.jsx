import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner - Versatile spinner component with multiple variants and sizes
 * @param {string} variant - Spinner style: 'primary', 'secondary', 'accent'
 * @param {string} size - Spinner size: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} text - Optional loading text
 * @param {string} className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  variant = 'primary', 
  size = 'md', 
  text = null,
  className = ''
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Variant color configurations
  const variantClasses = {
    primary: 'text-blue-500',
    secondary: 'text-zinc-400',
    accent: 'text-orange-400'
  };

  const spinnerClass = `${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  const textClass = `${textSizes[size]} ${variantClasses[variant]} mt-2`;

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={spinnerClass}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg 
          className="w-full h-full" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
      
      {text && (
        <motion.p
          className={textClass}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
