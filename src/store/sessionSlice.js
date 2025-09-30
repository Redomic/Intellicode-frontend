import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import sessionAPI from '../services/sessionAPI';
import { SESSION_STATES, isSessionActive } from '../constants/sessionConstants';
import { parseUTCTimestamp, getNowUTC } from '../utils/dateUtils';

/**
 * Optimized Session Slice
 * - Direct sessionAPI calls (no orchestrator)
 * - Minimal state (derive everything from currentSession)
 * - No event listeners
 * - Single source of truth: backend
 */

// ============================================================================
// ASYNC THUNKS - Direct sessionAPI calls
// ============================================================================

export const startSession = createAsyncThunk(
  'session/start',
  async (config, { rejectWithValue }) => {
    try {
      console.log('🚀 Starting session with config:', config);
      const response = await sessionAPI.startSession(config);
      console.log('📥 Backend response:', response);
      
      if (!response || !response.session_id) {
        console.error('❌ Invalid response from backend:', response);
        return rejectWithValue('Backend returned invalid response');
      }
      
      // Fetch full session data
      console.log('🔄 Fetching full session data for ID:', response.session_id);
      const session = await sessionAPI.getSession(response.session_id);
      console.log('✅ Full session data retrieved:', session);
      
      return { session, config };
    } catch (error) {
      console.error('❌ Error in startSession thunk:', error);
      return rejectWithValue(error.message || 'Failed to start session');
    }
  }
);

export const endSession = createAsyncThunk(
  'session/end',
  async ({ reason = 'user_request', analytics = {} } = {}, { getState, rejectWithValue }) => {
    try {
      const sessionId = getState().session.currentSession?.sessionId;
      if (!sessionId) throw new Error('No active session');
      
      await sessionAPI.endSession(sessionId, reason, analytics);
      return { sessionId, reason };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to end session');
    }
  }
);

export const fetchActiveSession = createAsyncThunk(
  'session/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const session = await sessionAPI.getActiveSession();
      return { session };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch active session');
    }
  }
);

export const updateSessionCode = createAsyncThunk(
  'session/updateCode',
  async ({ code, language }, { getState, rejectWithValue }) => {
    try {
      const sessionId = getState().session.currentSession?.sessionId;
      if (!sessionId) return;
      
      await sessionAPI.updateCurrentCode(sessionId, code, language);
      return { code, language };
    } catch (error) {
      // Silent fail for code updates
      console.warn('Failed to update code:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addSessionEvent = createAsyncThunk(
  'session/addEvent',
  async ({ eventType, data }, { getState, rejectWithValue }) => {
    try {
      const sessionId = getState().session.currentSession?.sessionId;
      if (!sessionId) return;
      
      await sessionAPI.addSessionEvent(sessionId, eventType, data);
      return { eventType, data };
    } catch (error) {
      console.warn('Failed to add event:', error);
      return rejectWithValue(error.message);
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const initialState = {
  // Core session data
  currentSession: null,
  
  // Loading states
  isLoading: false,
  
  // Error
  error: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Manual session load (for recovery)
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      state.error = null;
    },
    
    // Clear session
    clearSession: (state) => {
      state.currentSession = null;
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Start session
      .addCase(startSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        console.log('✅ Session stored in Redux:', {
          sessionId: action.payload.session?.sessionId,
          startTime: action.payload.session?.startTime,
          sessionType: action.payload.session?.sessionType
        });
      })
      .addCase(startSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // End session
      .addCase(endSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(endSession.fulfilled, (state) => {
        state.isLoading = false;
        state.currentSession = null;
        state.error = null;
      })
      .addCase(endSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      
      // Fetch active session
      .addCase(fetchActiveSession.fulfilled, (state, action) => {
        if (action.payload.session) {
          state.currentSession = action.payload.session;
        }
      })
      
      // Update code (silent)
      .addCase(updateSessionCode.fulfilled, () => {
        // No state update needed
      });
  }
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setCurrentSession,
  clearSession,
  clearError,
} = sessionSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

// Basic selectors
export const selectCurrentSession = (state) => state.session.currentSession;
export const selectIsLoading = (state) => state.session.isLoading;
export const selectError = (state) => state.session.error;

// Derived selectors (memoized)
export const selectIsActive = createSelector(
  [selectCurrentSession],
  (session) => isSessionActive(session)
);

// Removed pause-related selectors

export const selectHasActiveSession = createSelector(
  [selectCurrentSession],
  (session) => session && isSessionActive(session)
);

export const selectSessionId = createSelector(
  [selectCurrentSession],
  (session) => session?.sessionId
);

export const selectSessionDuration = createSelector(
  [selectCurrentSession, (_, currentTime) => currentTime],
  (session, currentTime) => {
    if (!session?.startTime) return 0;
    // Use UTC-aligned timestamp parsing
    const startMs = parseUTCTimestamp(session.startTime);
    const nowMs = currentTime || getNowUTC();
    return Math.max(0, nowMs - startMs);
  }
);

// ============================================================================
// REDUCER
// ============================================================================

export default sessionSlice.reducer;
