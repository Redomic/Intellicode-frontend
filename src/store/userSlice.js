import { createSlice } from '@reduxjs/toolkit';
import { SKILL_LEVELS } from '../constants/skillLevels';

const initialState = {
  // Authentication state
  isAuthenticated: false,
  accessToken: localStorage.getItem('access_token') || null,
  currentUser: null,
  authError: null,
  
  // User data
  isOnboarded: false,
  skillLevel: null,
  expertiseRank: 600, // Default beginner rank
  currentStreak: 0,
  totalProblemsCompleted: 0,
  dailyGoal: 3,
  assessmentHistory: [],
  profile: {
    username: '',
    joinedDate: null,
    preferences: {
      theme: 'dark',
      notifications: true,
      difficulty: 'adaptive'
    }
  },
  progress: {
    weak_topics: [],
    strong_topics: [],
    recent_activity: []
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSkillLevel: (state, action) => {
      state.skillLevel = action.payload;
    },
    completeOnboarding: (state, action) => {
      state.isOnboarded = true;
      state.skillLevel = action.payload.skillLevel;
      state.profile.username = action.payload.username || '';
      state.profile.joinedDate = new Date().toISOString();
      
      // Set expertise rank from assessment
      if (action.payload.expertiseRank) {
        state.expertiseRank = action.payload.expertiseRank;
      }
      
      // Store assessment result
      if (action.payload.assessmentResult) {
        if (!Array.isArray(state.assessmentHistory)) {
          state.assessmentHistory = [];
        }
        state.assessmentHistory.push({
          ...action.payload.assessmentResult,
          completedAt: new Date().toISOString(),
          type: 'onboarding'
        });
      }
      
      // Update preferences from onboarding
      if (action.payload.preferences) {
        state.profile.preferences = {
          ...state.profile.preferences,
          ...action.payload.preferences
        };
      }
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    incrementStreak: (state) => {
      state.currentStreak += 1;
    },
    resetStreak: (state) => {
      state.currentStreak = 0;
    },
    incrementProblemsCompleted: (state) => {
      state.totalProblemsCompleted += 1;
    },
    updateProgress: (state, action) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    setDailyGoal: (state, action) => {
      state.dailyGoal = action.payload;
    },
    updatePreferences: (state, action) => {
      state.profile.preferences = { 
        ...state.profile.preferences, 
        ...action.payload 
      };
    },
    
    updateExpertiseRank: (state, action) => {
      state.expertiseRank = action.payload;
    },
    
    addAssessmentResult: (state, action) => {
      if (!Array.isArray(state.assessmentHistory)) {
        state.assessmentHistory = [];
      }
      state.assessmentHistory.push({
        ...action.payload,
        completedAt: new Date().toISOString()
      });
    },
    
    // Authentication actions
    setAuthToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('access_token', action.payload);
      } else {
        localStorage.removeItem('access_token');
      }
    },
    
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      
      // Update profile information from user data
      if (action.payload) {
        state.profile.username = action.payload.name || action.payload.username || '';
        // Check if user has completed onboarding based on user data
        state.isOnboarded = action.payload.onboarding_completed || false;
      }
    },
    
    clearAuthData: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.currentUser = null;
      localStorage.removeItem('access_token');
    },
    
    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
    
    clearAuthError: (state) => {
      state.authError = null;
    }
  }
});

export const {
  setSkillLevel,
  completeOnboarding,
  updateProfile,
  incrementStreak,
  resetStreak,
  incrementProblemsCompleted,
  updateProgress,
  setDailyGoal,
  updatePreferences,
  updateExpertiseRank,
  addAssessmentResult,
  setAuthToken,
  setCurrentUser,
  clearAuthData,
  setAuthError,
  clearAuthError
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user;
export const selectIsOnboarded = (state) => state.user.isOnboarded;
export const selectSkillLevel = (state) => state.user.skillLevel;
export const selectExpertiseRank = (state) => state.user.expertiseRank;
export const selectAssessmentHistory = (state) => state.user.assessmentHistory;
export const selectUserProgress = (state) => state.user.progress;
export const selectUserPreferences = (state) => state.user.profile.preferences;

// Authentication selectors
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectAccessToken = (state) => state.user.accessToken;
export const selectAuthError = (state) => state.user.authError;

export default userSlice.reducer;
