import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAccessToken, selectIsAuthenticated, setCurrentUser, clearAuthData } from '../store/userSlice';
import useAuth from '../hooks/useAuth';
import FullPageLoading from './ui/FullPageLoading';

/**
 * AuthStateManager component for handling authentication state persistence
 * @param {Object} props - Component props
 */
const AuthStateManager = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { getCurrentUser } = useAuth();
  
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAuth = useCallback(async () => {
    try {
      // If we have a token stored but no user data, try to fetch user
      if (accessToken && !isAuthenticated) {
        const currentUser = await getCurrentUser();
        dispatch(setCurrentUser(currentUser));
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      // Clear invalid auth data
      dispatch(clearAuthData());
    } finally {
      setIsInitialized(true);
    }
  }, [accessToken, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleLogout = () => {
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
