import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsOnboarded, selectIsAuthenticated } from '../store/userSlice';

/**
 * OnboardingProtectedRoute - Simplified onboarding route protection
 * Relies on AuthStateManager for fresh user data from backend
 * Prevents access to onboarding if user has already completed it
 */
const OnboardingProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboarded = useSelector(selectIsOnboarded);

  console.log('📝 OnboardingProtectedRoute - Checking access:', {
    isAuthenticated,
    isOnboarded
  });

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 OnboardingProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user has already completed onboarding, redirect to dashboard
  if (isAuthenticated && isOnboarded) {
    console.log('✅ OnboardingProtectedRoute - Already onboarded, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated but not onboarded - allow access to onboarding
  console.log('✅ OnboardingProtectedRoute - Access granted to onboarding flow');
  return children;
};

export default OnboardingProtectedRoute;
