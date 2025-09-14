import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notifications
 * @returns {Object} - Notification methods and state
 */
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      isVisible: true,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    const duration = options.duration || 5000;
    if (options.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification(message, 'success', options);
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification(message, 'error', options);
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification(message, 'warning', options);
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification(message, 'info', options);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;
