import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  startSession,
  endSession,
  fetchActiveSession,
  updateSessionCode,
  addSessionEvent,
  setCurrentSession,
  clearSession,
  clearError,
  selectCurrentSession,
  selectIsLoading,
  selectError,
  selectIsActive,
  selectHasActiveSession,
  selectSessionId,
  selectSessionDuration,
} from '../store/sessionSlice';
import { calculateElapsedSeconds, formatDuration } from '../utils/dateUtils';

/**
 * Optimized useSession Hook
 * 
 * Clean, simple interface for session management:
 * - No event listeners or side effects
 * - Direct Redux integration
 * - All state derived from currentSession
 * 
 * Usage:
 *   const { currentSession, isActive, startSession, endSession } = useSession();
 */
const useSession = () => {
  const dispatch = useDispatch();

  // State selectors
  const currentSession = useSelector(selectCurrentSession);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isActive = useSelector(selectIsActive);
  const hasActiveSession = useSelector(selectHasActiveSession);
  const sessionId = useSelector(selectSessionId);

  // Action creators wrapped in useCallback
  const handleStartSession = useCallback(
    (config) => dispatch(startSession(config)),
    [dispatch]
  );

  const handleEndSession = useCallback(
    (options) => dispatch(endSession(options)),
    [dispatch]
  );

  const handleFetchActiveSession = useCallback(
    () => dispatch(fetchActiveSession()),
    [dispatch]
  );

  const handleUpdateCode = useCallback(
    (code, language) => dispatch(updateSessionCode({ code, language })),
    [dispatch]
  );

  const handleAddEvent = useCallback(
    (eventType, data) => dispatch(addSessionEvent({ eventType, data })),
    [dispatch]
  );

  const handleSetSession = useCallback(
    (session) => dispatch(setCurrentSession(session)),
    [dispatch]
  );

  const handleClearSession = useCallback(
    () => dispatch(clearSession()),
    [dispatch]
  );

  const handleClearError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  // Helper to get formatted duration (UTC-aligned)
  const getFormattedDuration = useCallback(() => {
    if (!currentSession?.startTime) return '00:00';
    const elapsedSeconds = calculateElapsedSeconds(currentSession.startTime);
    return formatDuration(elapsedSeconds);
  }, [currentSession]);

  // Placeholder stubs for features not yet migrated
  // TODO: Implement these when analytics system is built
  const loadHistory = useCallback(() => {
    // Silent no-op
  }, []);

  // Tracking stubs - use updateCode and addEvent internally
  const trackCodeChange = useCallback((code, language) => {
    handleUpdateCode(code, language);
  }, [handleUpdateCode]);

  const trackTestRun = useCallback((data) => {
    handleAddEvent('test_run', data);
  }, [handleAddEvent]);

  const trackHintUsed = useCallback((data) => {
    handleAddEvent('hint_used', data);
  }, [handleAddEvent]);

  const trackSolutionSubmitted = useCallback((data) => {
    handleAddEvent('solution_submitted', data);
  }, [handleAddEvent]);

  return {
    // State
    currentSession,
    isLoading,
    error,
    isActive,
    hasActiveSession,
    sessionId,
    
    // Placeholder state for backwards compatibility
    sessionHistory: [],
    sessionInsights: null,
    sessionAnalytics: null,
    needsRecovery: false,
    recoveryData: null,
    
    // Actions
    startSession: handleStartSession,
    endSession: handleEndSession,
    fetchActiveSession: handleFetchActiveSession,
    updateCode: handleUpdateCode,
    addEvent: handleAddEvent,
    setSession: handleSetSession,
    clearSession: handleClearSession,
    clearError: handleClearError,
    loadHistory,
    
    // Tracking (legacy compatibility)
    trackCodeChange,
    trackTestRun,
    trackHintUsed,
    trackSolutionSubmitted,
    
    // Helpers
    getFormattedDuration,
  };
};

export default useSession;
