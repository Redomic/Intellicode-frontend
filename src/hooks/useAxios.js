import { useState, useEffect } from 'react';
import api from '../utils/axios';

/**
 * Custom hook for making HTTP requests with Axios
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request body data
 * @param {boolean} options.immediate - Whether to execute request immediately
 * @param {Array} options.deps - Dependencies to trigger re-fetch
 * @returns {Object} - { data, loading, error, execute, reset }
 */
const useAxios = (url, options = {}) => {
  const {
    method = 'GET',
    data = null,
    immediate = true,
    deps = [],
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = async (customData = data, customUrl = url) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const config = {
        method: method.toLowerCase(),
        url: customUrl,
      };

      // Add data to request based on method
      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && customData) {
        config.data = customData;
      } else if (method.toLowerCase() === 'get' && customData) {
        config.params = customData;
      }

      const response = await api(config);
      
      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'An error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  };

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  };

  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, [url, immediate, ...deps]);

  return {
    ...state,
    execute,
    reset,
  };
};

export default useAxios;
