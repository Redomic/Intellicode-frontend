import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useAxios from './useAxios';
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
  const getUserHook = useAxios('/auth/me', { method: 'GET', immediate: false });

  const loading = loginHook.loading || registerHook.loading || getUserHook.loading;

  const login = async (credentials) => {
    dispatch(clearAuthError());

    try {
      const response = await loginHook.execute(credentials);
      const { access_token } = response;

      // Store token in Redux and localStorage
      dispatch(setAuthToken(access_token));

      // Get user info
      const userResponse = await getUserHook.execute();
      
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
      const userResponse = await getUserHook.execute();
      
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
      const response = await getUserHook.execute();
      return response;
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
