import { v4 as uuidv4 } from 'uuid';
import sessionAPI from './sessionAPI';

export const SESSION_STATES = {
  IDLE: 'idle',
  PREPARING: 'preparing', 
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  ERROR: 'error'
};

export const SESSION_TYPES = {
  DAILY_CHALLENGE: 'daily_challenge',
  ROADMAP_CHALLENGE: 'roadmap_challenge', 
  PRACTICE: 'practice',
  ASSESSMENT: 'assessment'
};

export const SESSION_EVENTS = {
  STARTED: 'session_started',
  PAUSED: 'session_paused',
  RESUMED: 'session_resumed',
  COMPLETED: 'session_completed',
  ABANDONED: 'session_abandoned',
  ERROR: 'session_error',
  METRICS_UPDATED: 'session_metrics_updated',
  WARNING: 'session_warning'
};

class SessionOrchestrator {
  constructor() {
    this.currentSession = null;
    this.sessionHistory = [];
    this.listeners = new Set();
    this.backendSyncEnabled = true; // Enable backend synchronization
    this.syncInProgress = false;
    this.lastCodeSyncTime = 0;
    this.codeSyncThrottleMs = 2000; // Throttle code sync to every 2 seconds
    this.initializeFromStorage();
    this.setupPageUnloadHandlers();
  }

  async initializeFromStorage() {
    try {
      console.log('🔄 Initializing session state from backend...');
      
      // Explicitly ensure we start with no session
      this.currentSession = null;
      
      // Always fetch from backend only - no local storage
      if (this.backendSyncEnabled) {
        try {
          const backendSession = await this.checkForActiveSessionInBackend();
          
          if (backendSession) {
            console.log('✅ Found active session in backend, attempting recovery...');
            const success = await this.recoverSessionFromBackend(backendSession.session_id);
            if (success) {
              console.log('🌐 Session recovered from backend:', backendSession.session_id);
              // Emit event to sync Redux state
              this.emit('INITIALIZED', { hasSession: true });
            } else {
              console.warn('⚠️ Session recovery failed - clearing state');
              this.clearSession();
              this.emit('INITIALIZED', { hasSession: false });
            }
          } else {
            console.log('✅ No active session in backend - starting fresh');
            this.clearSession();
            this.emit('INITIALIZED', { hasSession: false });
          }
        } catch (error) {
          console.warn('⚠️ Failed to check backend for active sessions:', error);
          this.clearSession();
          this.emit('INITIALIZED', { hasSession: false });
        }
      } else {
        this.clearSession();
        this.emit('INITIALIZED', { hasSession: false });
      }
    } catch (error) {
      console.warn('Failed to initialize session:', error);
      this.clearSession();
      this.emit('INITIALIZED', { hasSession: false });
    }
  }

  setupPageUnloadHandlers() {
    const handlePageUnload = async () => {
      if (this.currentSession && this.currentSession.state === SESSION_STATES.ACTIVE) {
        // Pause in backend only - no local storage
        if (this.backendSyncEnabled && this.currentSession.backendSynced) {
          try {
            await sessionAPI.pauseSession(this.currentSession.id, 'page_unload');
          } catch (error) {
            console.warn('Failed to pause session on unload:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('pagehide', handlePageUnload);
  }

  async startSession(config = {}) {
    try {
      if (this.currentSession && this.currentSession.state === SESSION_STATES.ACTIVE) {
        await this.endSession('new_session_started');
      }

      const sessionId = uuidv4();
      const now = new Date().toISOString();
      
      // Create local session object
      this.currentSession = {
        id: sessionId,
        type: config.type || SESSION_TYPES.PRACTICE,
        state: SESSION_STATES.ACTIVE,
        startTime: now,
        lastActivity: now,
        endTime: null,
        config: config,
        questionId: config.questionId || null,
        questionTitle: config.questionTitle || null,
        roadmapId: config.roadmapId || null,
        difficulty: config.difficulty || null,
        language: config.language || 'python',
        behaviorSessionId: null,
        analytics: {
          codeChanges: 0,
          testsRun: 0,
          hintsUsed: 0,
          attemptsCount: 0,
          isCompleted: false
        },
        keyEvents: [],
        codeSnapshots: [],
        needsRecovery: false,
        backendSynced: false // Track backend sync status
      };

      // Start behavior tracking
      if (config.enableBehaviorTracking) {
        const behaviorSessionId = `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.currentSession.behaviorSessionId = behaviorSessionId;
        console.log('Behavior tracking started with session ID:', behaviorSessionId);
      }

      // Save locally first
      // Session state maintained in backend only

      // Sync with backend if enabled
      if (this.backendSyncEnabled) {
        try {
          const backendSessionData = sessionAPI.createSessionData({
            sessionId: sessionId,
            type: config.type || SESSION_TYPES.PRACTICE,
            questionId: config.questionId,
            questionTitle: config.questionTitle,
            roadmapId: config.roadmapId,
            difficulty: config.difficulty,
            language: config.language || 'python',
            enableBehaviorTracking: config.enableBehaviorTracking,
            enableFullscreen: config.enableFullscreen,
            timeCommitment: config.timeCommitment,
            userAgreements: config.userAgreements,
            behaviorSessionId: this.currentSession.behaviorSessionId
          });

          const backendResponse = await sessionAPI.startSession(backendSessionData);
          this.currentSession.backendSynced = true;
          this.currentSession.backendSessionId = backendResponse.session_id;
          
          console.log('✅ Session created in backend:', backendResponse.session_id);
        } catch (error) {
          console.warn('⚠️ Failed to sync session with backend, continuing locally:', error);
          this.currentSession.backendSynced = false;
          // Continue with local session even if backend fails
        }
      }
      
      this.emit(SESSION_EVENTS.STARTED, { sessionId, timestamp: now });
      
      console.log(`📊 Session started: ${sessionId}`, this.currentSession);
      return sessionId;

    } catch (error) {
      console.error('Failed to start session:', error);
      this.emit(SESSION_EVENTS.ERROR, { error: error.message });
      throw error;
    }
  }

  async pauseSession(reason = 'user_request') {
    if (!this.currentSession) {
      console.warn('⚠️ No active session to pause');
      return false;
    }
    
    // Check if session is in a valid state to pause
    const terminalStates = [SESSION_STATES.COMPLETED, SESSION_STATES.ABANDONED];
    if (terminalStates.includes(this.currentSession.state)) {
      console.warn(`⚠️ Cannot pause session in terminal state: ${this.currentSession.state}`);
      return false;
    }
    
    // If already paused, treat as success
    if (this.currentSession.state === SESSION_STATES.PAUSED) {
      console.log('ℹ️ Session already paused');
      return true;
    }
    
    // Only pause if active
    if (this.currentSession.state !== SESSION_STATES.ACTIVE) {
      console.warn(`⚠️ Cannot pause session in state: ${this.currentSession.state}`);
      return false;
    }

    // Update local state
    this.currentSession.state = SESSION_STATES.PAUSED;
    this.currentSession.lastActivity = new Date().toISOString();

    // Sync with backend if available
    if (this.backendSyncEnabled && this.currentSession.backendSynced) {
      try {
        await sessionAPI.pauseSession(this.currentSession.id, reason);
        console.log('✅ Session paused in backend');
      } catch (error) {
        console.warn('⚠️ Failed to pause session in backend:', error);
        // Continue with local pause even if backend fails
      }
    }

    this.emit(SESSION_EVENTS.PAUSED, { sessionId: this.currentSession.id, reason });
    
    console.log(`⏸️ Session paused: ${this.currentSession.id}`);
    return true;
  }

  async resumeSession() {
    if (!this.currentSession) {
      console.warn('⚠️ No session to resume');
      return false;
    }
    
    // Check if session is in a valid state to resume
    const terminalStates = [SESSION_STATES.COMPLETED, SESSION_STATES.ABANDONED];
    if (terminalStates.includes(this.currentSession.state)) {
      console.warn(`⚠️ Cannot resume session in terminal state: ${this.currentSession.state}`);
      return false;
    }
    
    // If already active, treat as success
    if (this.currentSession.state === SESSION_STATES.ACTIVE) {
      console.log('ℹ️ Session already active');
      return true;
    }
    
    // Only resume if paused
    if (this.currentSession.state !== SESSION_STATES.PAUSED) {
      console.warn(`⚠️ Cannot resume session in state: ${this.currentSession.state}`);
      return false;
    }

    // Update local state
    this.currentSession.state = SESSION_STATES.ACTIVE;
    this.currentSession.lastActivity = new Date().toISOString();
    this.currentSession.needsRecovery = false;

    // Sync with backend if available
    if (this.backendSyncEnabled && this.currentSession.backendSynced) {
      try {
        await sessionAPI.resumeSession(this.currentSession.id);
        console.log('✅ Session resumed in backend');
      } catch (error) {
        console.warn('⚠️ Failed to resume session in backend:', error);
        // Continue with local resume even if backend fails
      }
    }

    this.emit(SESSION_EVENTS.RESUMED, { sessionId: this.currentSession.id });
    
    console.log(`▶️ Session resumed: ${this.currentSession.id}`);
    return true;
  }

  async endSession(reason = 'user_request') {
    if (!this.currentSession) {
      console.warn('⚠️ No session to end');
      return false;
    }

    const sessionId = this.currentSession.id;
    const backendSynced = this.currentSession.backendSynced;
    
    // Check if session is already in terminal state
    const terminalStates = [SESSION_STATES.COMPLETED, SESSION_STATES.ABANDONED];
    if (terminalStates.includes(this.currentSession.state)) {
      console.log(`ℹ️ Session already ended in state: ${this.currentSession.state}`);
      // Still completely clear it from memory
      this.clearSession();
      return true;
    }
    
    console.log(`🛑 Ending session ${sessionId} with reason: ${reason}`);
    
    // Update local state
    this.currentSession.state = reason === 'completed' ? SESSION_STATES.COMPLETED : SESSION_STATES.ABANDONED;
    this.currentSession.endTime = new Date().toISOString();
    
    // Sync with backend FIRST before clearing local state
    if (this.backendSyncEnabled && backendSynced) {
      try {
        await sessionAPI.endSession(sessionId, reason);
        console.log('✅ Session ended in backend successfully');
      } catch (error) {
        console.error('❌ Failed to end session in backend:', error);
        // Continue with local end even if backend fails
      }
    }

    // Move to history
    this.sessionHistory.unshift({ ...this.currentSession });
    
    // COMPLETELY clear the session from memory
    this.clearSession();
    
    console.log(`✅ Session completely cleared from memory: ${sessionId}`);
    
    this.emit(reason === 'completed' ? SESSION_EVENTS.COMPLETED : SESSION_EVENTS.ABANDONED, { sessionId, reason });

    // After emitting, force a state sync with Redux to ensure UI updates
    this.emit('STATE_SYNC_REQUEST');

    return true;
  }
  
  clearSession() {
    // Complete session cleanup - ensure nothing persists
    console.log('🧹 Clearing all session state...');
    this.currentSession = null;
    this.syncInProgress = false;
    this.lastCodeSyncTime = 0;
    console.log('✅ Session state cleared');
  }

  /**
   * Hard resets the orchestrator's state. To be used when navigating away
   * from session-critical pages to ensure a clean slate.
   */
  forceResetState() {
    console.log('💣 FORCE RESETTING ORCHESTRATOR STATE 💣');
    this.clearSession();
    this.sessionHistory = [];
    this.emit('INITIALIZED', { hasSession: false });
  }

  recordEvent(eventType, data = {}) {
    if (!this.currentSession) return;
    
    // Don't mutate currentSession directly - it's managed by Redux
    // Just sync with backend
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    };

    this.updateLastActivity();
    
    // Sync event to backend
    if (this.backendSyncEnabled && this.currentSession.backendSynced) {
      this.syncEventToBackend(event);
    }
  }
  
  async syncEventToBackend(event) {
    if (!this.currentSession || !this.currentSession.backendSessionId) return;
    
    try {
      await sessionAPI.addSessionEvent(this.currentSession.backendSessionId || this.currentSession.id, event);
    } catch (error) {
      console.warn('Failed to sync event to backend:', error);
    }
  }

  async updateCodeSnapshot(code, language = 'python') {
    if (!this.currentSession) return;

    // Don't mutate currentSession directly - it's managed by Redux
    // Just sync with backend (throttled)
    this.updateLastActivity();

    // Throttled sync with backend for current code state
    this.syncCurrentCodeWithBackend(code, language);
  }

  // Throttled method to sync current code with backend
  syncCurrentCodeWithBackend(code, language) {
    if (!this.backendSyncEnabled || !this.currentSession?.backendSynced) return;

    const now = Date.now();
    if (now - this.lastCodeSyncTime < this.codeSyncThrottleMs) {
      // Clear any pending sync and schedule a new one
      if (this.pendingCodeSync) {
        clearTimeout(this.pendingCodeSync);
      }
      
      this.pendingCodeSync = setTimeout(() => {
        this.doSyncCurrentCode(code, language);
      }, this.codeSyncThrottleMs - (now - this.lastCodeSyncTime));
      
      return;
    }

    this.doSyncCurrentCode(code, language);
  }

  async doSyncCurrentCode(code, language) {
    if (!this.currentSession?.backendSynced) return;

    try {
      this.lastCodeSyncTime = Date.now();
      await sessionAPI.updateCurrentCode(this.currentSession.id, code, language);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Current code synced with backend');
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync current code with backend:', error);
    }
  }

  updateLastActivity() {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();
    }
  }

  getCurrentSession() {
    // Don't return sessions in terminal states
    if (this.currentSession) {
      const terminalStates = [SESSION_STATES.COMPLETED, SESSION_STATES.ABANDONED, SESSION_STATES.EXPIRED];
      if (terminalStates.includes(this.currentSession.state)) {
        return null;
      }
    }
    return this.currentSession;
  }

  getSessionHistory(limit = 10) {
    return this.sessionHistory.slice(0, limit);
  }

  getSessionAnalytics(sessionId = null) {
    const session = sessionId ? 
      this.sessionHistory.find(s => s.id === sessionId) : 
      this.currentSession;
    
    if (!session) {
      return null;
    }

    return {
      ...session.analytics,
      sessionId: session.id,
      duration: session.endTime ? 
        new Date(session.endTime) - new Date(session.startTime) : 
        Date.now() - new Date(session.startTime),
      state: session.state,
      type: session.type
    };
  }

  needsRecovery() {
    // Don't trigger recovery for sessions in terminal states
    if (this.currentSession) {
      const terminalStates = [SESSION_STATES.COMPLETED, SESSION_STATES.ABANDONED, SESSION_STATES.EXPIRED];
      if (terminalStates.includes(this.currentSession.state)) {
        return false;
      }
      return this.currentSession.needsRecovery;
    }
    return false;
  }

  async getRecoveryData() {
    if (!this.needsRecovery()) return null;

    const timePaused = Math.floor((Date.now() - new Date(this.currentSession.lastActivity).getTime()) / 1000);
    let lastCode = this.currentSession.codeSnapshots[this.currentSession.codeSnapshots.length - 1] || null;

    // Try to get the most recent code from backend if available
    if (this.backendSyncEnabled && this.currentSession.backendSynced) {
      try {
        const currentCodeData = await sessionAPI.getCurrentCode(this.currentSession.id);
        if (currentCodeData && currentCodeData.code) {
          lastCode = {
            code: currentCodeData.code,
            language: currentCodeData.language,
            timestamp: currentCodeData.timestamp
          };
        }
      } catch (error) {
        console.warn('⚠️ Failed to get current code from backend, using local:', error);
      }
    }
    
    return {
      sessionId: this.currentSession.id,
      questionTitle: this.currentSession.questionTitle,
      timePaused,
      lastCode,
      analytics: this.currentSession.analytics
    };
  }

  // New method for recovering sessions from backend
  async recoverSessionFromBackend(sessionId) {
    try {
      const recoveryData = await sessionAPI.getSessionRecoveryData(sessionId);
      
      if (recoveryData && recoveryData.session) {
        // ==> ADDED VALIDATION <==
        // Strictly ensure we don't recover a session in a terminal state
        const terminalStates = ['completed', 'abandoned', 'expired'];
        if (terminalStates.includes(recoveryData.session.state)) {
          console.warn(`[Orchestrator] Attempted to recover session ${sessionId} in terminal state: ${recoveryData.session.state}. Recovery aborted.`);
          this.clearSession(); // Ensure local state is clean
          return false;
        }

        // Convert backend session to local format
        this.currentSession = {
          id: recoveryData.session.session_id,
          type: recoveryData.session.session_type,
          state: recoveryData.session.state,
          startTime: recoveryData.session.start_time,
          lastActivity: recoveryData.session.last_activity,
          endTime: recoveryData.session.end_time,
          config: recoveryData.session.config || {},
          questionId: recoveryData.session.question_id,
          questionTitle: recoveryData.session.question_title,
          roadmapId: recoveryData.session.roadmap_id,
          difficulty: recoveryData.session.difficulty,
          language: recoveryData.language || 'python',
          behaviorSessionId: recoveryData.session.behavior_session_id,
          analytics: recoveryData.session.analytics || {},
          keyEvents: recoveryData.session.session_events || [],
          codeSnapshots: recoveryData.session.code_snapshots || [],
          needsRecovery: false, // Already recovered from backend
          backendSynced: true,
          backendSessionId: recoveryData.session.session_id,
          currentCode: recoveryData.current_code || ''
        };

        // Session state maintained in backend only
        console.log('✅ Session recovered from backend:', sessionId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to recover session from backend:', error);
      return false;
    }
  }

  // Enhanced method to check for sessions on backend
  async checkForActiveSessionInBackend() {
    if (!this.backendSyncEnabled) return null;

    try {
      console.log('🔍 Checking backend for active sessions...');
      const activeSession = await sessionAPI.getActiveSession();
      
      console.log('📡 Backend response for active session:', activeSession);
      
      if (!activeSession) {
        console.log('ℹ️ No active session in backend');
        return null;
      }
      
      // Strictly validate the session state
      console.log(`[Orchestrator] Validating state of fetched session: ${activeSession.state}`);
      const validStates = ['active', 'paused'];
      const terminalStates = ['completed', 'abandoned', 'expired'];
      
      if (terminalStates.includes(activeSession.state)) {
        console.warn(`⚠️ Backend returned session in terminal state: ${activeSession.state}. Ignoring.`);
        return null;
      }
      
      if (!validStates.includes(activeSession.state)) {
        console.warn(`⚠️ Backend returned session in unexpected state: ${activeSession.state}. Ignoring.`);
        return null;
      }
      
      console.log(`✅ Found valid active session in state: ${activeSession.state}`);
      return activeSession;
      
    } catch (error) {
      console.warn('⚠️ Failed to check for active session in backend:', error);
      return null;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  emit(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.warn('Session event listener error:', error);
      }
    });
  }
}

export const sessionOrchestrator = new SessionOrchestrator();

if (process.env.NODE_ENV === 'development') {
  window.sessionOrchestrator = sessionOrchestrator;
}

export default sessionOrchestrator;