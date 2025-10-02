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
  
  // Track the last checked user to detect when user data changes
  const lastCheckedUserKeyRef = useRef(null);

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
      console.log('OnboardingProtectedRoute - Validating user access:', {
        userKey,
        hasCurrentUser: !!currentUser,
        isAuthenticated
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
      
      // Validate response structure before using it
      if (!status || typeof status !== 'object') {
        console.error('OnboardingProtectedRoute - Invalid response structure:', {
          receivedStatus: status,
          statusType: typeof status
        });
        setHasCheckedBackend(true);
        return;
      }
      
      console.log('OnboardingProtectedRoute - Received valid status:', {
        onboardingCompleted: status.onboarding_completed,
        hasCompletedAssessment: status.has_completed_assessment,
        shouldRedirect: status.should_redirect_to_dashboard
      });
      
      setOnboardingStatus(status);
      
      // Update Redux state if backend has more recent data
      // Added null check to prevent "Cannot read properties of undefined" error
      if (status.onboarding_completed === true && !isOnboarded) {
        dispatch(setCurrentUser({
          ...currentUser,
          onboarding_completed: true,
          expertise_rank: status.expertise_rank || null
        }));
      }
      
      setHasCheckedBackend(true);
      } catch (error) {
        console.error('OnboardingProtectedRoute - API call failed:', {
          errorMessage: error.message,
          errorStatus: error.response?.status,
          errorDetail: error.response?.data?.detail,
          userKey
        });
        
        // If user not found (404), clear invalid auth data
        if (error.response?.status === 404 || 
            error.response?.data?.detail?.includes('User not found')) {
          console.warn('OnboardingProtectedRoute - User not found in backend, clearing auth data');
          dispatch(clearAuthData());
          // Don't set hasCheckedBackend to allow re-authentication
          return;
        }
        
        // Fallback to Redux state for other errors
        console.log('OnboardingProtectedRoute - Falling back to Redux state after error');
        setHasCheckedBackend(true);
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser, dispatch, isOnboarded]);

  // Check onboarding status with backend for strict validation
  useEffect(() => {
    const userKey = currentUser?._key || currentUser?.key;
    const userOnboardingStatus = currentUser?.onboarding_completed;
    
    // Reset cache if user changed or onboarding status changed in currentUser
    // This handles the case where user completes assessment and Redux updates
    if (userKey && userKey !== lastCheckedUserKeyRef.current) {
      console.log('OnboardingProtectedRoute - User key changed, resetting cache:', {
        oldKey: lastCheckedUserKeyRef.current,
        newKey: userKey
      });
      setHasCheckedBackend(false);
      setOnboardingStatus(null);
      lastCheckedUserKeyRef.current = userKey;
    }
    
    // Also reset if the currentUser.onboarding_completed field changes
    // This catches updates from OnboardingFlow after completing assessment
    if (hasCheckedBackend && onboardingStatus && 
        userOnboardingStatus !== onboardingStatus.onboarding_completed) {
      console.log('OnboardingProtectedRoute - User onboarding status changed in Redux, resetting cache:', {
        reduxStatus: userOnboardingStatus,
        cachedStatus: onboardingStatus.onboarding_completed
      });
      setHasCheckedBackend(false);
      setOnboardingStatus(null);
    }
    
    if (isAuthenticated && currentUser && !hasCheckedBackend && !isCheckingRef.current) {
      checkOnboardingStatus();
    } else if (!isAuthenticated || !currentUser) {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser, hasCheckedBackend, checkOnboardingStatus, onboardingStatus]);

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
