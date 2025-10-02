import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser, clearAuthData, setAuthToken } from '../store/userSlice';
import api from '../utils/axios';
import FullPageLoading from './ui/FullPageLoading';

/**
 * AuthStateManager - Simplified authentication state manager
 * ALWAYS fetches fresh user data from backend if token exists
 * No localStorage caching of user data - backend is the source of truth
 */
const AuthStateManager = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('access_token');
        
        if (token) {
          // Set token in Redux first
          dispatch(setAuthToken(token));
          
          // ALWAYS fetch fresh user data from backend
          console.log('🔄 AuthStateManager - Fetching fresh user data from backend');
          const response = await api.get('/auth/me');
          const userData = response.data;
          
          console.log('✅ AuthStateManager - User data fetched:', {
            key: userData.key,
            email: userData.email,
            onboardingCompleted: userData.onboarding_completed
          });
          
          dispatch(setCurrentUser(userData));
        } else {
          console.log('ℹ️ AuthStateManager - No token found, user not authenticated');
        }
      } catch (error) {
        console.error('❌ AuthStateManager - Failed to fetch user data:', error);
        // Clear invalid auth data if token is invalid
        dispatch(clearAuthData());
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      console.log('🚪 AuthStateManager - Logout event received');
      dispatch(clearAuthData());
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <FullPageLoading 
        message="Initializing your session..."
        subtitle="Setting up your personalized learning environment"
        showLogo={true}
      />
    );
  }

  return children;
};

export default AuthStateManager;
