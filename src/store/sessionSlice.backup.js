import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { sessionOrchestrator, SESSION_STATES, SESSION_EVENTS } from '../services/sessionOrchestrator';

/**
 * Async actions for session management
 */

// Start a new session
export const startSession = createAsyncThunk(
  'session/start',
  async (config, { rejectWithValue }) => {
    try {
      const sessionId = await sessionOrchestrator.startSession(config);
      // Get session from backend to populate state
      const session = await sessionOrchestrator.getCurrentSession();
      return { sessionId, session, config };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// End current session
export const endSession = createAsyncThunk(
  'session/end',
  async ({ reason = 'user_request', analytics = {} }, { getState, rejectWithValue }) => {
    try {
      const { session } = getState();
      if (!session.currentSession) {
        return null;
      }
      
      const sessionId = session.currentSession.session_id;
      await sessionOrchestrator.endSession(sessionId, reason);
      return { sessionId, reason };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Pause current session
export const pauseSession = createAsyncThunk(
  'session/pause',
  async (reason = 'user_request', { getState, rejectWithValue }) => {
    try {
      const { session } = getState();
      if (!session.currentSession) {
        throw new Error('No active session to pause');
      }
      
      const sessionId = session.currentSession.session_id;
      await sessionOrchestrator.pauseSession(sessionId, reason);
      return { sessionId, reason };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Resume paused session
export const resumeSession = createAsyncThunk(
  'session/resume',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { session } = getState();
      if (!session.currentSession) {
        throw new Error('No session to resume');
      }
      
      const sessionId = session.currentSession.session_id || session.currentSession.sessionId;
      await sessionOrchestrator.resumeSession(sessionId);
      
      // Fetch the full session data after resuming
      const updatedSession = await sessionOrchestrator.getCurrentSession();
      return { sessionId, session: updatedSession };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Load session history
export const loadSessionHistory = createAsyncThunk(
  'session/loadHistory',
  async (limit = 10) => {
    const history = sessionOrchestrator.getSessionHistory(limit);
    return history;
  }
);

// Initial state - ALWAYS start clean, let orchestrator sync asynchronously
const initialState = {
  // Current session
  currentSession: null,
  
  // Session state
  isActive: false,
  isPaused: false,
  needsRecovery: false,
  
  // Loading states
  isStarting: false,
  isEnding: false,
  isPausing: false,
  isResuming: false,
  
  // Session history
  sessionHistory: [],
  isLoadingHistory: false,
  
  // Live metrics
  liveMetrics: null,
  metricsHistory: [],
  
  // Recovery data (don't call async function directly - will be loaded on demand)
  recoveryData: null,
  
  // Errors
  error: null,
  
  // Session configuration
  sessionConfig: null,
  
  // UI state
  showSessionModal: false,
  showRecoveryModal: false,
  showSessionTimer: false,
  
  // Notifications
  sessionNotifications: [],
  
  // Analytics
  currentAnalytics: null,
  
  // Session insights
  insights: {
    streakDays: 0,
    totalSessions: 0,
    averageSessionTime: 0,
    completionRate: 0,
    preferredTimeSlot: null,
    strongAreas: [],
    improvementAreas: []
  }
};

// Session slice
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Update current session data
    updateCurrentSession: (state, action) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },
    
    // Update live metrics
    updateLiveMetrics: (state, action) => {
      state.liveMetrics = action.payload;
      
      // Add to metrics history
      state.metricsHistory.push({
        ...action.payload,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 metrics
      if (state.metricsHistory.length > 100) {
        state.metricsHistory = state.metricsHistory.slice(-100);
      }
    },
    
    // Record session event
    recordSessionEvent: (state, action) => {
      const { eventType, data } = action.payload;
      
      if (state.currentSession) {
        if (!state.currentSession.keyEvents) {
          state.currentSession.keyEvents = [];
        }
        
        state.currentSession.keyEvents.push({
          type: eventType,
          timestamp: new Date().toISOString(),
          data
        });
        
        // Update analytics based on event type
        if (!state.currentSession.analytics) {
          state.currentSession.analytics = {
            totalTimeActive: 0,
            codeChanges: 0,
            testsRun: 0,
            hintsUsed: 0,
            attemptsCount: 0
          };
        }
        
        switch (eventType) {
          case 'code_change':
            state.currentSession.analytics.codeChanges++;
            break;
          case 'test_run':
            state.currentSession.analytics.testsRun++;
            break;
          case 'hint_used':
            state.currentSession.analytics.hintsUsed++;
            break;
          case 'attempt_submitted':
            state.currentSession.analytics.attemptsCount++;
            break;
          case 'solution_completed':
            state.currentSession.analytics.isCompleted = true;
            state.currentSession.analytics.completionTime = new Date().toISOString();
            break;
        }
        
        state.currentSession.lastActivity = new Date().toISOString();
      }
      
      // Also record in session orchestrator (with sessionId)
      if (state.currentSession?.session_id) {
        sessionOrchestrator.recordEvent(state.currentSession.session_id, eventType, data);
      }
    },
    
    // Update code snapshot
    updateCodeSnapshot: (state, action) => {
      const { code, language } = action.payload;
      
      if (state.currentSession) {
        if (!state.currentSession.codeSnapshots) {
          state.currentSession.codeSnapshots = [];
        }
        
        state.currentSession.codeSnapshots.push({
          timestamp: new Date().toISOString(),
          code,
          language,
          length: code.length
        });
        
        // Keep only last 20 snapshots
        if (state.currentSession.codeSnapshots.length > 20) {
          state.currentSession.codeSnapshots = state.currentSession.codeSnapshots.slice(-20);
        }
        
        state.currentSession.lastActivity = new Date().toISOString();
        
        // Also update in session orchestrator (with sessionId)
        sessionOrchestrator.updateCodeSnapshot(state.currentSession.session_id, code, language);
      }
    },
    
    // Clear recovery state
    clearRecoveryState: (state) => {
      state.needsRecovery = false;
      state.recoveryData = null;
      state.showRecoveryModal = false;
    },
    
    // Add session notification
    addSessionNotification: (state, action) => {
      state.sessionNotifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 10 notifications
      if (state.sessionNotifications.length > 10) {
        state.sessionNotifications = state.sessionNotifications.slice(-10);
      }
    },
    
    // Remove session notification
    removeSessionNotification: (state, action) => {
      state.sessionNotifications = state.sessionNotifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    // Clear session error
    clearSessionError: (state) => {
      state.error = null;
    },
    
    // Set current session (for manual loading)
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      state.isActive = action.payload?.state === SESSION_STATES.ACTIVE;
      state.isPaused = action.payload?.state === SESSION_STATES.PAUSED;
      state.currentAnalytics = action.payload?.analytics || null;
    },
    
    // Toggle UI modals
    toggleSessionModal: (state, action) => {
      state.showSessionModal = action.payload ?? !state.showSessionModal;
    },
    
    toggleRecoveryModal: (state, action) => {
      state.showRecoveryModal = action.payload ?? !state.showRecoveryModal;
    },
    
    toggleSessionTimer: (state, action) => {
      state.showSessionTimer = action.payload ?? !state.showSessionTimer;
    },
    
    // Update session insights
    updateSessionInsights: (state, action) => {
      state.insights = { ...state.insights, ...action.payload };
    },
    
    // Sync with orchestrator state (simplified - backend is source of truth)
    syncWithOrchestrator: (state) => {
      // Orchestrator.getCurrentSession() is async now, so this is handled by async thunks
      // This reducer is kept for backward compatibility but does nothing
      // State updates happen through async thunks that fetch from backend
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Start session
      .addCase(startSession.pending, (state) => {
        state.isStarting = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.isStarting = false;
        state.currentSession = action.payload.session;
        state.isActive = true;
        state.isPaused = false;
        state.needsRecovery = false;
        state.recoveryData = null;
        state.showRecoveryModal = false;
        state.sessionConfig = action.payload.config;
        state.currentAnalytics = action.payload.session?.analytics || null;
        
        // Add notification
        state.sessionNotifications.push({
          id: Date.now(),
          type: 'success',
          message: 'Session started successfully',
          timestamp: new Date().toISOString()
        });
      })
      .addCase(startSession.rejected, (state, action) => {
        state.isStarting = false;
        state.error = action.payload;
        
        state.sessionNotifications.push({
          id: Date.now(),
          type: 'error',
          message: `Failed to start session: ${action.payload}`,
          timestamp: new Date().toISOString()
        });
      })
      
      // End session
      .addCase(endSession.pending, (state) => {
        state.isEnding = true;
        state.error = null;
      })
      .addCase(endSession.fulfilled, (state, action) => {
        // COMPLETELY clear all session state - reset to initial state
        state.isEnding = false;
        state.currentSession = null;
        state.isActive = false;
        state.isPaused = false;
        state.needsRecovery = false;
        state.recoveryData = null;
        state.currentAnalytics = null;
        state.liveMetrics = null;
        state.sessionConfig = null;
        state.showRecoveryModal = false;
        state.showSessionModal = false;
        state.showSessionTimer = false;
        state.metricsHistory = [];
        
        // Clear any error state
        state.error = null;
        
        if (action.payload) {
          state.sessionNotifications.push({
            id: Date.now(),
            type: 'info',
            message: `Session ended: ${action.payload.reason}`,
            timestamp: new Date().toISOString()
          });
        }
      })
      .addCase(endSession.rejected, (state, action) => {
        state.isEnding = false;
        state.error = action.payload;
      })
      
      // Pause session
      .addCase(pauseSession.pending, (state) => {
        state.isPausing = true;
        state.error = null;
      })
      .addCase(pauseSession.fulfilled, (state, action) => {
        state.isPausing = false;
        state.isActive = false;
        state.isPaused = true;
        if (state.currentSession) {
          state.currentSession.state = SESSION_STATES.PAUSED;
        }
        
        state.sessionNotifications.push({
          id: Date.now(),
          type: 'warning',
          message: `Session paused: ${action.payload.reason}`,
          timestamp: new Date().toISOString()
        });
      })
      .addCase(pauseSession.rejected, (state, action) => {
        state.isPausing = false;
        state.error = action.payload;
      })
      
      // Resume session
      .addCase(resumeSession.pending, (state) => {
        state.isResuming = true;
        state.error = null;
      })
      .addCase(resumeSession.fulfilled, (state, action) => {
        state.isResuming = false;
        state.isActive = true;
        state.isPaused = false;
        state.needsRecovery = false;
        state.showRecoveryModal = false;
        
        // Update currentSession with fresh data from backend
        if (action.payload.session) {
          state.currentSession = action.payload.session;
          state.currentAnalytics = action.payload.session.analytics || null;
        } else if (state.currentSession) {
          state.currentSession.state = SESSION_STATES.ACTIVE;
        }
        
        state.sessionNotifications.push({
          id: Date.now(),
          type: 'success',
          message: 'Session resumed successfully',
          timestamp: new Date().toISOString()
        });
      })
      .addCase(resumeSession.rejected, (state, action) => {
        state.isResuming = false;
        state.error = action.payload;
      })
      
      // Load session history
      .addCase(loadSessionHistory.pending, (state) => {
        state.isLoadingHistory = true;
      })
      .addCase(loadSessionHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.sessionHistory = action.payload;
        
        // Update insights based on history
        if (action.payload.length > 0) {
          const completedSessions = action.payload.filter(s => s.state === SESSION_STATES.COMPLETED);
          const totalTime = action.payload.reduce((sum, s) => sum + (s.analytics?.totalDuration || 0), 0);
          
          state.insights.totalSessions = action.payload.length;
          state.insights.averageSessionTime = totalTime / action.payload.length;
          state.insights.completionRate = (completedSessions.length / action.payload.length) * 100;
        }
      })
      .addCase(loadSessionHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const {
  updateCurrentSession,
  updateLiveMetrics,
  recordSessionEvent,
  updateCodeSnapshot,
  clearRecoveryState,
  addSessionNotification,
  removeSessionNotification,
  clearSessionError,
  setCurrentSession,
  toggleSessionModal,
  toggleRecoveryModal,
  toggleSessionTimer,
  updateSessionInsights,
  syncWithOrchestrator
} = sessionSlice.actions;

// Selectors
export const selectCurrentSession = (state) => state.session.currentSession;
export const selectIsSessionActive = (state) => state.session.isActive;
export const selectIsSessionPaused = (state) => state.session.isPaused;
export const selectSessionNeedsRecovery = (state) => state.session.needsRecovery;
export const selectRecoveryData = (state) => state.session.recoveryData;
export const selectSessionHistory = (state) => state.session.sessionHistory;
export const selectSessionAnalytics = (state) => state.session.currentAnalytics;
export const selectLiveMetrics = (state) => state.session.liveMetrics;
export const selectSessionError = (state) => state.session.error;
export const selectSessionNotifications = (state) => state.session.sessionNotifications;
export const selectSessionInsights = (state) => state.session.insights;
export const selectSessionConfig = (state) => state.session.sessionConfig;

// Loading selectors
export const selectIsStartingSession = (state) => state.session.isStarting;
export const selectIsEndingSession = (state) => state.session.isEnding;
export const selectIsPausingSession = (state) => state.session.isPausing;
export const selectIsResumingSession = (state) => state.session.isResuming;
export const selectIsLoadingHistory = (state) => state.session.isLoadingHistory;

// UI selectors
export const selectShowSessionModal = (state) => state.session.showSessionModal;
export const selectShowRecoveryModal = (state) => state.session.showRecoveryModal;
export const selectShowSessionTimer = (state) => state.session.showSessionTimer;

// Complex selectors - memoized to prevent unnecessary rerenders
export const selectSessionProgress = createSelector(
  [selectCurrentSession, (state, currentTime) => currentTime || Date.now()],
  (session, now) => {
    if (!session) return null;
    
    const startTime = new Date(session.startTime).getTime();
    const elapsed = now - startTime;
    
    const timeCommitment = session.config?.timeCommitment || '30min';
    const targetTime = parseInt(timeCommitment) * 60 * 1000; // Convert to milliseconds
    
    return {
      elapsed,
      target: targetTime,
      progress: Math.min((elapsed / targetTime) * 100, 100),
      remaining: Math.max(targetTime - elapsed, 0)
    };
  }
);

export const selectSessionSummary = createSelector(
  [selectCurrentSession, selectSessionAnalytics],
  (session, analytics) => {
    if (!session) return null;
    
    return {
      id: session.id,
      type: session.type,
      questionTitle: session.questionTitle,
      language: session.language,
      startTime: session.startTime,
      duration: analytics?.duration || 0,
      state: session.state,
      analytics: session.analytics,
      isCompleted: session.analytics?.isCompleted || false
    };
  }
);

export default sessionSlice.reducer;

// Orchestrator event listener setup
let orchestratorListener = null;

export const setupSessionOrchestratorSync = (dispatch) => {
  if (!dispatch) {
    console.error('setupSessionOrchestratorSync: dispatch is required');
    return;
  }

  if (orchestratorListener) {
    sessionOrchestrator.removeListener(orchestratorListener);
  }
  
  orchestratorListener = (eventType, data) => {
    try {
      switch (eventType) {
        case 'INITIALIZED':
          // Orchestrator finished async initialization, sync state
          console.log('🔄 Orchestrator initialized, syncing Redux state');
          dispatch(syncWithOrchestrator());
          break;
          
        case SESSION_EVENTS.STARTED:
          dispatch(syncWithOrchestrator());
          dispatch(addSessionNotification({
            type: 'success',
            message: 'Session started successfully'
          }));
          break;
        
      case SESSION_EVENTS.PAUSED:
        dispatch(syncWithOrchestrator());
        dispatch(addSessionNotification({
          type: 'warning',
          message: `Session paused: ${data.reason}`
        }));
        break;
        
      case SESSION_EVENTS.RESUMED:
        dispatch(syncWithOrchestrator());
        dispatch(addSessionNotification({
          type: 'success',
          message: 'Session resumed'
        }));
        break;
        
      case SESSION_EVENTS.COMPLETED:
        dispatch(syncWithOrchestrator());
        dispatch(addSessionNotification({
          type: 'success',
          message: 'Session completed successfully!'
        }));
        break;
        
      case SESSION_EVENTS.ABANDONED:
        dispatch(syncWithOrchestrator());
        dispatch(addSessionNotification({
          type: 'info',
          message: 'Session ended'
        }));
        break;
        
      case SESSION_EVENTS.ERROR:
        dispatch(addSessionNotification({
          type: 'error',
          message: `Session error: ${data.error}`
        }));
        break;
        
      default:
        break;
    }
    } catch (error) {
      console.error('Error in session orchestrator event listener:', error);
    }
  };
  
  sessionOrchestrator.addListener(orchestratorListener);
};

export const cleanupSessionOrchestratorSync = () => {
  if (orchestratorListener) {
    sessionOrchestrator.removeListener(orchestratorListener);
    orchestratorListener = null;
  }
};
