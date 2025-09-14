import React, { createContext, useContext, useState, useCallback } from 'react';
import FullPageLoading from '../components/ui/FullPageLoading';

/**
 * Global Loading Context for managing app-wide loading states
 */
const GlobalLoadingContext = createContext();

/**
 * GlobalLoadingProvider - Provider component for global loading state
 * @param {React.ReactNode} children - Child components
 */
export const GlobalLoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({
    // Global app loading (authentication, initial data, etc.)
    global: false,
    // Navigation loading (route changes)
    navigation: false,
    // API loading (general API calls)
    api: false,
    // File operations (uploads, downloads)
    file: false,
    // Custom loading states
    custom: {},
  });

  const [loadingMessages, setLoadingMessages] = useState({
    global: "Loading IntelliCode...",
    navigation: "Navigating...",
    api: "Processing request...",
    file: "Processing file...",
    custom: {},
  });

  /**
   * Start loading for a specific category
   * @param {string} category - Loading category (global, navigation, api, file, or custom key)
   * @param {string} message - Loading message
   */
  const startLoading = useCallback((category, message = null) => {
    setLoadingStates(prev => ({
      ...prev,
      [category === 'custom' ? 'custom' : category]: 
        category === 'custom' 
          ? { ...prev.custom, [message]: true }
          : true
    }));

    if (message) {
      setLoadingMessages(prev => ({
        ...prev,
        [category === 'custom' ? 'custom' : category]:
          category === 'custom'
            ? { ...prev.custom, [message]: message }
            : message
      }));
    }
  }, []);

  /**
   * Stop loading for a specific category
   * @param {string} category - Loading category
   * @param {string} customKey - Custom key for custom category
   */
  const stopLoading = useCallback((category, customKey = null) => {
    setLoadingStates(prev => {
      if (category === 'custom' && customKey) {
        const { [customKey]: removed, ...rest } = prev.custom;
        return { ...prev, custom: rest };
      }
      return { ...prev, [category]: false };
    });

    setLoadingMessages(prev => {
      if (category === 'custom' && customKey) {
        const { [customKey]: removed, ...rest } = prev.custom;
        return { ...prev, custom: rest };
      }
      return prev;
    });
  }, []);

  /**
   * Clear all loading states
   */
  const clearAllLoading = useCallback(() => {
    setLoadingStates({
      global: false,
      navigation: false,
      api: false,
      file: false,
      custom: {},
    });
    setLoadingMessages({
      global: "Loading IntelliCode...",
      navigation: "Navigating...",
      api: "Processing request...",
      file: "Processing file...",
      custom: {},
    });
  }, []);

  /**
   * Check if any loading state is active
   */
  const isAnyLoading = useCallback(() => {
    return loadingStates.global || 
           loadingStates.navigation || 
           loadingStates.api || 
           loadingStates.file ||
           Object.keys(loadingStates.custom).length > 0;
  }, [loadingStates]);

  /**
   * Get current loading message
   */
  const getCurrentMessage = useCallback(() => {
    if (loadingStates.global) return loadingMessages.global;
    if (loadingStates.navigation) return loadingMessages.navigation;
    if (loadingStates.api) return loadingMessages.api;
    if (loadingStates.file) return loadingMessages.file;
    
    const customKeys = Object.keys(loadingStates.custom);
    if (customKeys.length > 0) {
      return loadingMessages.custom[customKeys[0]] || "Loading...";
    }
    
    return "Loading...";
  }, [loadingStates, loadingMessages]);

  const value = {
    loadingStates,
    startLoading,
    stopLoading,
    clearAllLoading,
    isAnyLoading: isAnyLoading(),
    isGlobalLoading: loadingStates.global,
    isNavigationLoading: loadingStates.navigation,
    isApiLoading: loadingStates.api,
    isFileLoading: loadingStates.file,
    customLoadingStates: loadingStates.custom,
    currentMessage: getCurrentMessage(),
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      
      {/* Global Loading Overlay */}
      {loadingStates.global && (
        <FullPageLoading 
          message={loadingMessages.global}
          showLogo={true}
        />
      )}
    </GlobalLoadingContext.Provider>
  );
};

/**
 * Hook to use global loading context
 * @returns {Object} Global loading context value
 */
export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};

/**
 * Hook for managing specific loading operations
 * @param {string} category - Loading category
 * @returns {Object} Loading utilities for the category
 */
export const useLoadingOperation = (category = 'api') => {
  const { startLoading, stopLoading, loadingStates } = useGlobalLoading();

  const start = useCallback((message) => {
    startLoading(category, message);
  }, [category, startLoading]);

  const stop = useCallback((customKey) => {
    stopLoading(category, customKey);
  }, [category, stopLoading]);

  const isLoading = category === 'custom' 
    ? Object.keys(loadingStates.custom).length > 0
    : loadingStates[category];

  return {
    start,
    stop,
    isLoading,
  };
};

export default useGlobalLoading;

