import React, { useEffect, useState } from 'react';

/**
 * Notification component for displaying messages
 * @param {Object} props - Component props
 */
const Notification = ({ 
  type = 'info', 
  message, 
  isVisible = false, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    setIsShowing(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (isShowing && autoClose && onClose) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isShowing, autoClose, onClose, duration]);

  if (!message) return null;

  const getNotificationStyles = () => {
    const baseStyles = 'fixed top-4 right-4 max-w-md w-full p-4 rounded-lg shadow-lg border backdrop-blur-sm z-50 transform transition-all duration-300 ease-in-out';
    
    const typeStyles = {
      success: 'bg-green-900/90 border-green-700 text-green-100',
      error: 'bg-red-900/90 border-red-700 text-red-100',
      warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
      info: 'bg-blue-900/90 border-blue-700 text-blue-100'
    };

    const animationStyles = isShowing 
      ? 'translate-x-0 opacity-100' 
      : 'translate-x-full opacity-0';

    return `${baseStyles} ${typeStyles[type]} ${animationStyles}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleClose = () => {
    setIsShowing(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for animation to complete
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {onClose && (
          <button
            onClick={handleClose}
            className="ml-2 flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
