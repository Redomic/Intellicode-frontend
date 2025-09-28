import { v4 as uuidv4 } from 'uuid';

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
    this.initializeFromStorage();
    this.setupPageUnloadHandlers();
  }

  initializeFromStorage() {
    try {
      const storedSession = localStorage.getItem('intellit_current_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        const lastActivity = new Date(parsed.lastActivity);
        const now = new Date();
        const timeDiff = now - lastActivity;
        
        if (timeDiff < 3600000) { // 1 hour
          this.currentSession = {
            ...parsed,
            state: SESSION_STATES.PAUSED,
            needsRecovery: true
          };
          console.log('Session recovered from storage:', this.currentSession.id);
        } else {
          localStorage.removeItem('intellit_current_session');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize session from storage:', error);
    }
  }

  setupPageUnloadHandlers() {
    const handlePageUnload = () => {
      if (this.currentSession && this.currentSession.state === SESSION_STATES.ACTIVE) {
        this.currentSession.state = SESSION_STATES.PAUSED;
        this.currentSession.lastActivity = new Date().toISOString();
        this.saveSessionToStorage();
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
        needsRecovery: false
      };

      // Start behavior tracking
      if (config.enableBehaviorTracking) {
        const behaviorSessionId = `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.currentSession.behaviorSessionId = behaviorSessionId;
        console.log('Behavior tracking started with session ID:', behaviorSessionId);
      }
      
      this.saveSessionToStorage();
      this.emit(SESSION_EVENTS.STARTED, { sessionId, timestamp: now });
      
      console.log(`Main session started: ${sessionId}`, this.currentSession);
      return sessionId;

    } catch (error) {
      console.error('Failed to start session:', error);
      this.emit(SESSION_EVENTS.ERROR, { error: error.message });
      throw error;
    }
  }

  pauseSession(reason = 'user_request') {
    if (!this.currentSession || this.currentSession.state !== SESSION_STATES.ACTIVE) {
      return false;
    }

    this.currentSession.state = SESSION_STATES.PAUSED;
    this.currentSession.lastActivity = new Date().toISOString();
    this.saveSessionToStorage();
    this.emit(SESSION_EVENTS.PAUSED, { sessionId: this.currentSession.id, reason });
    
    console.log(`Session paused: ${this.currentSession.id}`);
    return true;
  }

  async resumeSession() {
    if (!this.currentSession || this.currentSession.state !== SESSION_STATES.PAUSED) {
      return false;
    }

    this.currentSession.state = SESSION_STATES.ACTIVE;
    this.currentSession.lastActivity = new Date().toISOString();
    this.currentSession.needsRecovery = false;
    
    this.saveSessionToStorage();
    this.emit(SESSION_EVENTS.RESUMED, { sessionId: this.currentSession.id });
    
    console.log(`Session resumed: ${this.currentSession.id}`);
    return true;
  }

  async endSession(reason = 'user_request') {
    if (!this.currentSession) return false;

    const sessionId = this.currentSession.id;
    this.currentSession.state = reason === 'completed' ? SESSION_STATES.COMPLETED : SESSION_STATES.ABANDONED;
    this.currentSession.endTime = new Date().toISOString();
    
    this.sessionHistory.unshift({ ...this.currentSession });
    this.currentSession = null;
    localStorage.removeItem('intellit_current_session');
    
    this.emit(reason === 'completed' ? SESSION_EVENTS.COMPLETED : SESSION_EVENTS.ABANDONED, { sessionId, reason });
    console.log(`Session ended: ${sessionId}`);
    return true;
  }

  recordEvent(eventType, data = {}) {
    if (!this.currentSession) return;
    
    this.currentSession.keyEvents.push({
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    });

    switch (eventType) {
      case 'code_change':
        this.currentSession.analytics.codeChanges++;
        break;
      case 'test_run':
        this.currentSession.analytics.testsRun++;
        break;
      case 'hint_used':
        this.currentSession.analytics.hintsUsed++;
        break;
    }

    this.updateLastActivity();
  }

  updateCodeSnapshot(code, language = 'python') {
    if (!this.currentSession) return;

    this.currentSession.codeSnapshots.push({
      timestamp: new Date().toISOString(),
      code,
      language,
      length: code.length
    });

    if (this.currentSession.codeSnapshots.length > 20) {
      this.currentSession.codeSnapshots = this.currentSession.codeSnapshots.slice(-20);
    }

    this.updateLastActivity();
    this.recordEvent('code_change', { codeLength: code.length });
  }

  updateLastActivity() {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();
    }
  }

  saveSessionToStorage() {
    if (!this.currentSession) return;
    try {
      localStorage.setItem('intellit_current_session', JSON.stringify(this.currentSession));
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  }

  getCurrentSession() {
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
    return this.currentSession && this.currentSession.needsRecovery;
  }

  getRecoveryData() {
    if (!this.needsRecovery()) return null;

    const timePaused = Math.floor((Date.now() - new Date(this.currentSession.lastActivity).getTime()) / 1000);
    
    return {
      sessionId: this.currentSession.id,
      questionTitle: this.currentSession.questionTitle,
      timePaused,
      lastCode: this.currentSession.codeSnapshots[this.currentSession.codeSnapshots.length - 1] || null,
      analytics: this.currentSession.analytics
    };
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