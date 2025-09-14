import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/axios';

/**
 * Custom hook for making HTTP requests with Axios
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request body data
 * @param {boolean} options.immediate - Whether to execute request immediately
 * @param {Array} options.deps - Dependencies to trigger re-fetch
 * @param {boolean} options.retryOnError - Whether to enable retry functionality
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.retryDelay - Delay between retries in milliseconds
 * @returns {Object} - { data, loading, error, execute, reset, retry, isRetrying, retryCount }
 */
const useAxios = (url, options = {}) => {
  const {
    method = 'GET',
    data = null,
    immediate = true,
    deps = [],
    retryOnError = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const executeRequest = useCallback(async (customData = data, customUrl = url, isRetryAttempt = false) => {
    // Cleanup any previous requests
    cleanup();

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      isRetrying: isRetryAttempt
    }));

    try {
      const config = {
        method: method.toLowerCase(),
        url: customUrl,
        signal: abortControllerRef.current.signal,
      };

      // Add data to request based on method
      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && customData) {
        config.data = customData;
      } else if (method.toLowerCase() === 'get' && customData) {
        config.params = customData;
      }

      const response = await api(config);
      
      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        error: null,
        isRetrying: false,
        retryCount: 0,
      }));

      return response.data;
    } catch (error) {
      // Don't handle aborted requests as errors
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return;
      }

      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'An error occurred';

      const currentRetryCount = isRetryAttempt ? state.retryCount + 1 : 0;
      
      // Auto-retry logic
      if (retryOnError && currentRetryCount < maxRetries && !isRetryAttempt) {
        setState(prev => ({
          ...prev,
          loading: false,
          isRetrying: true,
          retryCount: currentRetryCount + 1,
          error: `${errorMessage} (Retrying ${currentRetryCount + 1}/${maxRetries}...)`
        }));

        retryTimeoutRef.current = setTimeout(() => {
          executeRequest(customData, customUrl, true);
        }, retryDelay);
        
        return;
      }
      
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
        isRetrying: false,
        retryCount: currentRetryCount,
      }));

      throw error;
    }
  }, [data, url, method, retryOnError, maxRetries, retryDelay, cleanup, state.retryCount]);

  const execute = executeRequest;

  const reset = useCallback(() => {
    cleanup();
    setState({
      data: null,
      loading: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, [cleanup]);

  const retry = useCallback(() => {
    if (state.error && !state.loading) {
      execute();
    }
  }, [state.error, state.loading, execute]);

  const cancel = useCallback(() => {
    cleanup();
    setState(prev => ({
      ...prev,
      loading: false,
      isRetrying: false,
    }));
  }, [cleanup]);

  useEffect(() => {
    if (immediate && url) {
      execute();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [url, immediate, ...deps]);

  return {
    ...state,
    execute,
    reset,
    retry,
    cancel,
    // Convenience boolean states
    isLoading: state.loading || state.isRetrying,
    hasError: !!state.error,
    canRetry: !!state.error && !state.loading && !state.isRetrying,
  };
};

export default useAxios;
