import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  selectIsAuthenticated, 
  selectIsOnboarded
} from '../store/userSlice';

/**
 * ProtectedRoute - Simplified route protection
 * Relies on AuthStateManager to fetch fresh user data
 * No redundant API calls - Redux state is already fresh from backend
 */
const ProtectedRoute = ({ children, requireAuth = true, redirectAuthenticatedTo = null }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboarded = useSelector(selectIsOnboarded);

  console.log('🛡️ ProtectedRoute - Checking access:', {
    path: location.pathname,
    requireAuth,
    isAuthenticated,
    isOnboarded
  });

  // If route requires auth but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires auth and user is authenticated but not onboarded, redirect to onboarding
  if (requireAuth && isAuthenticated && !isOnboarded) {
    console.log('📝 ProtectedRoute - Not onboarded, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If route doesn't require auth but user is authenticated, 
  // redirect them based on onboarding status
  if (!requireAuth && isAuthenticated && redirectAuthenticatedTo === 'dashboard') {
    if (isOnboarded) {
      console.log('✅ ProtectedRoute - Authenticated and onboarded, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    } else {
      console.log('📝 ProtectedRoute - Authenticated but not onboarded, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }
  }

  console.log('✅ ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute;
