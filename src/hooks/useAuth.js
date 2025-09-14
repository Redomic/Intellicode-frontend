import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useAxios from './useAxios';
import api from '../utils/axios';
import { 
  setAuthToken, 
  setCurrentUser, 
  clearAuthData,
  setAuthError,
  clearAuthError,
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthError
} from '../store/userSlice';

/**
 * Validates user data to ensure it's complete and valid for onboarding
 * @param {Object} user - User object to validate
 * @returns {boolean} - Whether user is valid
 */
const isValidUser = (user) => {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  // Check for essential fields
  const hasEmail = user.email && user.email.trim().length > 0;
  const hasId = user._key || user.key || user.id;
  
  return hasEmail && hasId;
};

/**
 * Custom hook for authentication operations
 * @returns {Object} - Authentication methods and state
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const error = useSelector(selectAuthError);

  // API hooks for authentication operations
  const loginHook = useAxios('/auth/login', { method: 'POST', immediate: false });
  const registerHook = useAxios('/auth/register', { method: 'POST', immediate: false });

  const loading = loginHook.loading || registerHook.loading;

  const login = async (credentials) => {
    dispatch(clearAuthError());

    try {
      const response = await loginHook.execute(credentials);
      const { access_token } = response;

    // Store token in Redux and localStorage
    dispatch(setAuthToken(access_token));

    // Get user info using direct API call to ensure token is included
    const userApiResponse = await api.get('/auth/me');
    const userResponse = userApiResponse.data;
    
    if (!userResponse) {
      throw new Error('Failed to get user information after login');
    }
    
    // Validate user data before proceeding
    if (!isValidUser(userResponse)) {
      console.error('Invalid user data received:', userResponse);
      throw new Error('Invalid user data received. Please contact support.');
    }
    
    // Update Redux store with user data
    dispatch(setCurrentUser(userResponse));

    // Navigate based on onboarding status
    if (userResponse.onboarding_completed) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
      
    return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Invalid email or password. Please try again.';
      dispatch(setAuthError(errorMessage));
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch(clearAuthError());

    try {
      const response = await registerHook.execute(userData);
      
      // Auto-login after registration and redirect to onboarding
      const { access_token } = await loginHook.execute({
        email: userData.email,
        password: userData.password,
      });

      // Store token in Redux and localStorage
      dispatch(setAuthToken(access_token));

      // Get user info
      const userApiResponse = await api.get('/auth/me');
      const userResponse = userApiResponse.data;
      
      // Validate user data before proceeding
      if (!isValidUser(userResponse)) {
        console.error('Invalid user data received after registration:', userResponse);
        throw new Error('Invalid user data received. Please contact support.');
      }
      
      // Update Redux store with user data
      dispatch(setCurrentUser(userResponse));

      // New users should always go to onboarding
      navigate('/onboarding');

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Registration failed. Please try again.';
      dispatch(setAuthError(errorMessage));
      throw error;
    }
  };

  const logout = () => {
    dispatch(clearAuthData());
    navigate('/');
  };

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    login,
    register,
    logout,
    getCurrentUser,
    loading,
    error,
    isAuthenticated,
    currentUser,
    clearError: () => dispatch(clearAuthError()),
  };
};

export default useAuth;
