import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startSession,
  endSession,
  pauseSession,
  resumeSession,
  loadSessionHistory,
  recordSessionEvent,
  updateCodeSnapshot,
  clearRecoveryState,
  toggleSessionModal,
  toggleRecoveryModal,
  toggleSessionTimer,
  clearSessionError,
  syncWithOrchestrator,
  setupSessionOrchestratorSync,
  cleanupSessionOrchestratorSync,
  // Selectors
  selectCurrentSession,
  selectIsSessionActive,
  selectIsSessionPaused,
  selectSessionNeedsRecovery,
  selectRecoveryData,
  selectSessionHistory,
  selectSessionAnalytics,
  selectLiveMetrics,
  selectSessionError,
  selectSessionNotifications,
  selectSessionInsights,
  selectSessionConfig,
  selectIsStartingSession,
  selectIsEndingSession,
  selectIsPausingSession,
  selectIsResumingSession,
  selectIsLoadingHistory,
  selectShowSessionModal,
  selectShowRecoveryModal,
  selectShowSessionTimer,
  selectSessionProgress,
  selectSessionSummary
} from '../store/sessionSlice';
import { SESSION_TYPES } from '../services/sessionOrchestrator';

/**
 * useSession - Comprehensive session management hook
 * 
 * Provides a clean interface for components to:
 * - Start, pause, resume, and end coding sessions
 * - Track session metrics and analytics
 * - Handle session recovery
 * - Monitor live session data
 * - Manage session UI state
 */
const useSession = () => {
  const dispatch = useDispatch();

  // Current session state
  const currentSession = useSelector(selectCurrentSession);
  const isActive = useSelector(selectIsSessionActive);
  const isPaused = useSelector(selectIsSessionPaused);
  const needsRecovery = useSelector(selectSessionNeedsRecovery);
  const recoveryData = useSelector(selectRecoveryData);
  const sessionConfig = useSelector(selectSessionConfig);
  
  // Session data
  const sessionHistory = useSelector(selectSessionHistory);
  const sessionAnalytics = useSelector(selectSessionAnalytics);
  const liveMetrics = useSelector(selectLiveMetrics);
  const sessionProgress = useSelector(selectSessionProgress);
  const sessionSummary = useSelector(selectSessionSummary);
  const sessionInsights = useSelector(selectSessionInsights);
  
  // Loading states
  const isStarting = useSelector(selectIsStartingSession);
  const isEnding = useSelector(selectIsEndingSession);
  const isPausing = useSelector(selectIsPausingSession);
  const isResuming = useSelector(selectIsResumingSession);
  const isLoadingHistory = useSelector(selectIsLoadingHistory);
  
  // UI state
  const showSessionModal = useSelector(selectShowSessionModal);
  const showRecoveryModal = useSelector(selectShowRecoveryModal);
  const showSessionTimer = useSelector(selectShowSessionTimer);
  
  // Error handling
  const error = useSelector(selectSessionError);
  const notifications = useSelector(selectSessionNotifications);

  // Setup orchestrator sync on mount
  useEffect(() => {
    setupSessionOrchestratorSync(dispatch);
    dispatch(syncWithOrchestrator());
    
    return () => {
      cleanupSessionOrchestratorSync();
    };
  }, [dispatch]);

  // Session lifecycle methods
  const createSession = useCallback(async (config) => {
    if (!dispatch || typeof dispatch !== 'function') {
      throw new Error('Redux dispatch is not available');
    }

    try {
      const sessionConfig = {
        // Default configuration
        type: SESSION_TYPES.PRACTICE,
        enableBehaviorTracking: true,
        enableFullscreen: false,
        timeCommitment: '30min',
        autoSave: true,
        
        // Override with provided config
        ...config,
        
        // Ensure required fields
        startTime: new Date().toISOString()
      };
      
      if (!startSession || typeof startSession !== 'function') {
        throw new Error('startSession action creator is not available');
      }

      const result = await dispatch(startSession(sessionConfig));
      return result.payload?.sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, [dispatch]);

  const terminateSession = useCallback(async (reason = 'user_request', analytics = {}) => {
    try {
      await dispatch(endSession({ reason, analytics }));
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }, [dispatch]);

  const pauseCurrentSession = useCallback(async (reason = 'user_request') => {
    try {
      await dispatch(pauseSession(reason));
    } catch (error) {
      console.error('Failed to pause session:', error);
      throw error;
    }
  }, [dispatch]);

  const resumeCurrentSession = useCallback(async () => {
    try {
      await dispatch(resumeSession());
    } catch (error) {
      console.error('Failed to resume session:', error);
      throw error;
    }
  }, [dispatch]);

  // Session data methods
  const trackEvent = useCallback((eventType, data = {}) => {
    dispatch(recordSessionEvent({ eventType, data }));
  }, [dispatch]);

  const saveCodeSnapshot = useCallback((code, language = 'python') => {
    dispatch(updateCodeSnapshot({ code, language }));
  }, [dispatch]);

  const loadHistory = useCallback((limit = 10) => {
    dispatch(loadSessionHistory(limit));
  }, [dispatch]);

  // Recovery methods
  const dismissRecovery = useCallback(() => {
    dispatch(clearRecoveryState());
  }, [dispatch]);

  const recoverSession = useCallback(async () => {
    if (needsRecovery && recoveryData) {
      try {
        await resumeCurrentSession();
        // Manually clear recovery state after successful recovery
        dispatch(clearRecoveryState());
        return true;
      } catch (error) {
        console.error('Failed to recover session:', error);
        return false;
      }
    }
    return false;
  }, [needsRecovery, recoveryData, resumeCurrentSession, dispatch]);

  // UI management methods
  const toggleModal = useCallback((modalType, show) => {
    switch (modalType) {
      case 'session':
        dispatch(toggleSessionModal(show));
        break;
      case 'recovery':
        dispatch(toggleRecoveryModal(show));
        break;
      case 'timer':
        dispatch(toggleSessionTimer(show));
        break;
      default:
        console.warn('Unknown modal type:', modalType);
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSessionError());
  }, [dispatch]);

  // Convenience methods for different session types
  const startPracticeSession = useCallback(async (config = {}) => {
    return createSession({
      type: SESSION_TYPES.PRACTICE,
      ...config
    });
  }, [createSession]);

  const startDailyChallenge = useCallback(async (config = {}) => {
    return createSession({
      type: SESSION_TYPES.DAILY_CHALLENGE,
      enableFullscreen: true,
      ...config
    });
  }, [createSession]);

  const startRoadmapChallenge = useCallback(async (config = {}) => {
    return createSession({
      type: SESSION_TYPES.ROADMAP_CHALLENGE,
      enableFullscreen: true,
      ...config
    });
  }, [createSession]);

  const startAssessment = useCallback(async (config = {}) => {
    return createSession({
      type: SESSION_TYPES.ASSESSMENT,
      enableBehaviorTracking: true,
      enableFullscreen: true,
      ...config
    });
  }, [createSession]);

  // Session status helpers
  const isSessionRunning = isActive && !isPaused;
  const hasActiveSession = currentSession && (isActive || isPaused);
  const canResume = isPaused && !isStarting && !isResuming;
  const canPause = isActive && !isPausing;
  const canEnd = hasActiveSession && !isEnding;

  // Time tracking helpers
  const getSessionDuration = useCallback(() => {
    if (!currentSession) return 0;
    
    const startTime = new Date(currentSession.startTime);
    const now = new Date();
    return now - startTime;
  }, [currentSession]);

  const getFormattedDuration = useCallback(() => {
    const duration = getSessionDuration();
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [getSessionDuration]);

  // Analytics helpers
  const getCompletionRate = useCallback(() => {
    if (!sessionHistory.length) return 0;
    const completed = sessionHistory.filter(s => s.analytics?.isCompleted).length;
    return (completed / sessionHistory.length) * 100;
  }, [sessionHistory]);

  const getCurrentStreak = useCallback(() => {
    if (!sessionHistory.length) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (const session of sessionHistory) {
      const sessionDate = new Date(session.startTime);
      const diffDays = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak && session.analytics?.isCompleted) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [sessionHistory]);

  // Event tracking shortcuts
  const trackCodeChange = useCallback((code, language) => {
    saveCodeSnapshot(code, language);
    trackEvent('code_change', { codeLength: code.length, language });
  }, [saveCodeSnapshot, trackEvent]);

  const trackTestRun = useCallback((testResults) => {
    trackEvent('test_run', testResults);
  }, [trackEvent]);

  const trackHintUsed = useCallback((hintIndex, hintText) => {
    trackEvent('hint_used', { hintIndex, hintText });
  }, [trackEvent]);

  const trackSolutionSubmitted = useCallback((isCorrect, attempts = 1) => {
    trackEvent('attempt_submitted', { isCorrect, attempts });
    
    if (isCorrect) {
      trackEvent('solution_completed', { attempts });
    }
  }, [trackEvent]);

  // Debug helpers (development only)
  const debug = process.env.NODE_ENV === 'development' ? {
    currentSession,
    sessionState: {
      isActive,
      isPaused,
      needsRecovery,
      isStarting,
      isEnding,
      isPausing,
      isResuming
    },
    orchestratorState: () => {
      // Access orchestrator directly for debugging
      if (window.sessionOrchestrator) {
        return {
          currentSession: window.sessionOrchestrator.getCurrentSession(),
          sessionHistory: window.sessionOrchestrator.getSessionHistory(5)
        };
      }
      return null;
    }
  } : undefined;

  return {
    // Current session state
    currentSession,
    isActive,
    isPaused,
    isSessionRunning,
    hasActiveSession,
    needsRecovery,
    recoveryData,
    sessionConfig,
    
    // Session lifecycle
    startSession: createSession,
    endSession: terminateSession,
    pauseSession: pauseCurrentSession,
    resumeSession: resumeCurrentSession,
    
    // Convenience session starters
    startPracticeSession,
    startDailyChallenge,
    startRoadmapChallenge,
    startAssessment,
    
    // Session data and tracking
    trackEvent,
    trackCodeChange,
    trackTestRun,
    trackHintUsed,
    trackSolutionSubmitted,
    saveCodeSnapshot,
    
    // Session analytics
    sessionHistory,
    sessionAnalytics,
    liveMetrics,
    sessionProgress,
    sessionSummary,
    sessionInsights,
    getCompletionRate,
    getCurrentStreak,
    
    // Time tracking
    getSessionDuration,
    getFormattedDuration,
    
    // Recovery
    recoverSession,
    dismissRecovery,
    
    // History
    loadHistory,
    isLoadingHistory,
    
    // Loading states
    isStarting,
    isEnding,
    isPausing,
    isResuming,
    
    // UI state
    showSessionModal,
    showRecoveryModal,
    showSessionTimer,
    toggleModal,
    
    // Status helpers
    canPause,
    canResume,
    canEnd,
    
    // Error handling
    error,
    notifications,
    clearError,
    
    // Debug (development only)
    debug
  };
};

export default useSession;
