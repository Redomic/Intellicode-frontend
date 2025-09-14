import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * InlineLoading - Inline loading component for buttons, forms, etc.
 * @param {boolean} isLoading - Whether to show loading state
 * @param {React.ReactNode} children - Content to show when not loading
 * @param {string} loadingText - Text to show when loading
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether the element should be disabled when loading
 */
const InlineLoading = ({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  size = 'md',
  className = '',
  disabled = false
}) => {
  const sizeConfig = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerSizeConfig = {
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  };

  return (
    <motion.div 
      className={`relative inline-flex items-center justify-center ${className}`}
      animate={{ opacity: disabled && isLoading ? 0.6 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={false}
        animate={{ 
          opacity: isLoading ? 0 : 1,
          scale: isLoading ? 0.95 : 1
        }}
        transition={{ duration: 0.2 }}
        className={isLoading ? 'invisible' : 'visible'}
      >
        {children}
      </motion.div>
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <LoadingSpinner 
            size={spinnerSizeConfig[size]} 
            variant="primary"
            text={loadingText}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * LoadingButton - Button component with built-in loading state
 * @param {boolean} isLoading - Whether button is in loading state
 * @param {React.ReactNode} children - Button content
 * @param {string} loadingText - Text to show when loading
 * @param {string} variant - Button style variant
 * @param {string} size - Button size
 * @param {Function} onClick - Click handler
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} className - Additional CSS classes
 */
const LoadingButton = ({
  isLoading,
  children,
  loadingText = "Loading...",
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-zinc-100 to-blue-50 text-zinc-900 hover:from-blue-50 hover:to-white hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50',
    secondary: 'bg-transparent text-zinc-300 border-2 border-zinc-600 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-950/20 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    ghost: 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 disabled:opacity-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      <InlineLoading 
        isLoading={isLoading} 
        loadingText={loadingText}
        size={size}
      >
        {children}
      </InlineLoading>
    </button>
  );
};

export { InlineLoading, LoadingButton };
export default InlineLoading;

