import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  selectIsAuthenticated, 
  selectAccessToken, 
  selectIsOnboarded,
  setCurrentUser, 
  setAuthToken 
} from '../store/userSlice';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute component for handling authenticated routes
 * @param {Object} props - Component props
 */
const ProtectedRoute = ({ children, requireAuth = true, redirectAuthenticatedTo = null }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboarded = useSelector(selectIsOnboarded);
  const accessToken = useSelector(selectAccessToken);
  const { getCurrentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  const validateAuth = useCallback(async () => {
    try {
      // If we have a token but are not authenticated, try to validate it
      if (accessToken && !isAuthenticated) {
        const currentUser = await getCurrentUser();
        dispatch(setCurrentUser(currentUser));
        setIsValidated(true);
      } else if (isAuthenticated) {
        setIsValidated(true);
      }
    } catch (error) {
      console.error('Auth validation failed:', error);
      // Clear invalid token
      dispatch(setAuthToken(null));
      setIsValidated(false);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated, dispatch]);

  useEffect(() => {
    // Only validate if we need authentication
    if (requireAuth) {
      validateAuth();
    } else {
      setIsLoading(false);
      setIsValidated(true);
    }
  }, [requireAuth, validateAuth]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-400 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated, redirect to login
  if (requireAuth && !isValidated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires auth and user is authenticated but not onboarded, redirect to onboarding
  if (requireAuth && isAuthenticated && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // If route doesn't require auth but user is authenticated, 
  // redirect them based on onboarding status
  if (!requireAuth && isAuthenticated && redirectAuthenticatedTo === 'dashboard') {
    if (isOnboarded) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // If route doesn't require auth but user is authenticated, allow access
  // If route requires auth and user is authenticated, allow access
  return children;
};

export default ProtectedRoute;
