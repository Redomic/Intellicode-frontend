import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsOnboarded, selectIsAuthenticated, selectCurrentUser, setCurrentUser, clearAuthData } from '../store/userSlice';
import useAxios from '../hooks/useAxios';

/**
 * OnboardingProtectedRoute - Strict route protection for onboarding
 * Validates onboarding status with backend to prevent multiple assessments
 */
const OnboardingProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboarded = useSelector(selectIsOnboarded);
  const currentUser = useSelector(selectCurrentUser);
  
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedBackend, setHasCheckedBackend] = useState(false);
  
  const checkStatusHook = useAxios('', { method: 'GET', immediate: false });
  
  // Use ref to track if we're already checking to prevent multiple calls
  const isCheckingRef = useRef(false);

  // Memoize the check function to prevent recreation on every render
  const checkOnboardingStatus = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    
    try {
      if (!isAuthenticated || !currentUser) {
        setIsLoading(false);
        return;
      }

      const userKey = currentUser._key || currentUser.key;
      console.log('OnboardingProtectedRoute - checking user:', {
        currentUser,
        userKey,
        fullUser: JSON.stringify(currentUser, null, 2)
      });
      
      if (!userKey) {
        console.log('No user key found, setting loading false');
        setIsLoading(false);
        return;
      }

      const status = await checkStatusHook.execute(
        {},
        `/assessments/onboarding-status/${userKey}`
      );
      
      setOnboardingStatus(status);
      
      // Update Redux state if backend has more recent data
      if (status.onboarding_completed && !isOnboarded) {
        dispatch(setCurrentUser({
          ...currentUser,
          onboarding_completed: true,
          expertise_rank: status.expertise_rank
        }));
      }
      
      setHasCheckedBackend(true);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        
        // If user not found (404), clear invalid auth data
        if (error.response?.status === 404 || 
            error.response?.data?.detail?.includes('User not found')) {
          console.log('User not found in backend, clearing auth data...');
          dispatch(clearAuthData());
          // Don't set hasCheckedBackend to allow re-authentication
          return;
        }
        
        // Fallback to Redux state for other errors
        setHasCheckedBackend(true);
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, [isAuthenticated, currentUser, dispatch, isOnboarded]);

  // Check onboarding status with backend for strict validation
  useEffect(() => {
    if (isAuthenticated && currentUser && !hasCheckedBackend && !isCheckingRef.current) {
      checkOnboardingStatus();
    } else if (!isAuthenticated || !currentUser) {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser, hasCheckedBackend, checkOnboardingStatus]);

  // Show loading while checking backend
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-zinc-500 border-t-zinc-300 rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Validating access...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If backend check completed, use backend data for strict validation
  if (hasCheckedBackend && onboardingStatus) {
    if (onboardingStatus.should_redirect_to_dashboard) {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // Fallback to Redux state if backend check failed
    if (isAuthenticated && isOnboarded) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If user is authenticated but not onboarded, allow access to onboarding
  return children;
};

export default OnboardingProtectedRoute;
