import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthStateManager from './components/AuthStateManager';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingProtectedRoute from './components/OnboardingProtectedRoute';
import OnboardingFlow from './components/OnboardingFlow';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CodingPracticePage from './pages/Coding/CodingPracticePage';
import ProfilePage from './pages/Profile/ProfilePage';
import RoadmapPage from './pages/Roadmap/RoadmapPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthStateManager>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute requireAuth={false} redirectAuthenticatedTo="dashboard">
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false} redirectAuthenticatedTo="dashboard">
              <LoginPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false} redirectAuthenticatedTo="dashboard">
              <RegisterPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            <OnboardingProtectedRoute>
              <OnboardingFlow />
            </OnboardingProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
                <Route
          path="/challenge/:roadmap/:questionId"
          element={
            <ProtectedRoute requireAuth={true}>
              <CodingPracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute requireAuth={true}>
              <CodingPracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap/:course"
          element={
            <ProtectedRoute requireAuth={true}>
              <RoadmapPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthStateManager>
  );
}

export default App;
