import React from 'react';
import { motion } from 'framer-motion';

/**
 * SkeletonLoader - Shimmer skeleton loading component
 * @param {string} variant - Type of skeleton: 'text', 'card', 'profile', 'button', 'custom'
 * @param {number} lines - Number of text lines for 'text' variant
 * @param {string} className - Additional CSS classes
 * @param {Object} customDimensions - Custom width/height for 'custom' variant
 */
const SkeletonLoader = ({ 
  variant = 'text', 
  lines = 3, 
  className = '',
  customDimensions = { width: '100%', height: '20px' }
}) => {
  const shimmerAnimation = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const SkeletonBox = ({ width = '100%', height = '20px', className: boxClassName = '' }) => (
    <div 
      className={`relative bg-zinc-800 rounded overflow-hidden ${boxClassName}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"
        {...shimmerAnimation}
      />
    </div>
  );

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }, (_, index) => (
          <SkeletonBox 
            key={index}
            width={index === lines - 1 ? '70%' : '100%'}
            height="16px"
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center mb-4">
          <SkeletonBox width="48px" height="48px" className="rounded-full mr-4" />
          <div className="flex-1">
            <SkeletonBox width="60%" height="20px" className="mb-2" />
            <SkeletonBox width="40%" height="16px" />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <SkeletonBox width="100%" height="16px" />
          <SkeletonBox width="85%" height="16px" />
          <SkeletonBox width="70%" height="16px" />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <SkeletonBox width="80px" height="32px" className="rounded-lg" />
          <SkeletonBox width="60px" height="32px" className="rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <SkeletonBox width="64px" height="64px" className="rounded-full" />
        <div className="flex-1">
          <SkeletonBox width="150px" height="20px" className="mb-2" />
          <SkeletonBox width="100px" height="16px" className="mb-1" />
          <SkeletonBox width="80px" height="14px" />
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <SkeletonBox 
        width="120px" 
        height="40px" 
        className={`rounded-lg ${className}`} 
      />
    );
  }

  if (variant === 'heatmap') {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-4">
          <SkeletonBox width="200px" height="24px" />
          <SkeletonBox width="100px" height="20px" />
        </div>
        
        {/* Heatmap grid */}
        <div className="grid grid-cols-53 gap-1">
          {Array.from({ length: 371 }, (_, index) => (
            <SkeletonBox 
              key={index}
              width="12px" 
              height="12px" 
              className="rounded-sm" 
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <SkeletonBox width="80px" height="16px" />
          <div className="flex items-center space-x-2">
            <SkeletonBox width="50px" height="16px" />
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <SkeletonBox key={i} width="12px" height="12px" className="rounded-sm" />
              ))}
            </div>
            <SkeletonBox width="50px" height="16px" />
          </div>
        </div>
      </div>
    );
  }

  // Custom variant
  return (
    <SkeletonBox 
      width={customDimensions.width} 
      height={customDimensions.height} 
      className={className} 
    />
  );
};

export default SkeletonLoader;

