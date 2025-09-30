import axiosInstance from '../utils/axios';

/**
 * Session Management API
 * Handles backend session operations for pause/resume/end functionality
 * 
 * IMPORTANT: UTC Timezone Alignment
 * ==================================
 * - Backend sends all timestamps as UTC ISO strings with 'Z' suffix
 *   Example: "2025-09-30T18:34:11.701Z"
 * 
 * - Frontend uses UTC milliseconds (Date.now(), .getTime()) for calculations
 * 
 * - All datetime parsing/formatting uses dateUtils.js for consistency
 * 
 * This ensures session timers work correctly across all timezones.
 */

class SessionAPI {
  constructor() {
    this.baseURL = '/sessions';
  }

  /**
   * Start a new coding session
   */
  async startSession(sessionData) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/start`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw this.handleError(error);
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId, reason = 'user_request') {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/${sessionId}/end`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Failed to end session:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get session details
   */
  async getSession(sessionId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/${sessionId}`);
      return this.transformSession(response.data);
    } catch (error) {
      console.error('Failed to get session:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Transform backend session to frontend format (snake_case -> camelCase)
   */
  transformSession(session) {
    if (!session) {
      console.warn('⚠️ transformSession called with null/undefined session');
      return null;
    }
    
    const transformed = {
      ...session,
      sessionId: session.session_id || session.sessionId,
      sessionType: session.session_type || session.sessionType,
      questionId: session.question_id || session.questionId,
      questionTitle: session.question_title || session.questionTitle,
      roadmapId: session.roadmap_id || session.roadmapId,
      userKey: session.user_key || session.userKey,
      startTime: session.start_time || session.startTime,
      endTime: session.end_time || session.endTime,
      lastActivity: session.last_activity || session.lastActivity,
      pauseTime: session.pause_time || session.pauseTime,
      resumeTime: session.resume_time || session.resumeTime,
      pauseDurationSeconds: session.pause_duration_seconds || session.pauseDurationSeconds,
      currentCode: session.current_code || session.currentCode,
      starterCode: session.starter_code || session.starterCode,
      testCases: session.test_cases || session.testCases,
      skillCategories: session.skill_categories || session.skillCategories,
      enableBehaviorTracking: session.enable_behavior_tracking ?? session.enableBehaviorTracking,
      enableFullscreen: session.enable_fullscreen ?? session.enableFullscreen,
      timeCommitment: session.time_commitment || session.timeCommitment,
      userAgreements: session.user_agreements || session.userAgreements,
      behaviorSessionId: session.behavior_session_id || session.behaviorSessionId,
    };
    
    console.log('🔄 transformSession DETAILED:', {
      'INPUT start_time': session.start_time,
      'INPUT startTime': session.startTime,
      'OUTPUT startTime': transformed.startTime,
      'OUTPUT sessionId': transformed.sessionId,
      'OUTPUT state': transformed.state,
      'Raw session keys': Object.keys(session).join(', ')
    });
    
    return transformed;
  }

  /**
   * Get user's active session
   */
  async getActiveSession() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/active/current`);
      return this.transformSession(response.data);
    } catch (error) {
      console.error('Failed to get active session:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user's active session for a specific question
   */
  async getActiveSessionByQuestion(questionId = null, questionTitle = null) {
    try {
      const params = {};
      if (questionId) params.question_id = questionId;
      if (questionTitle) params.question_title = questionTitle;
      
      const response = await axiosInstance.get(`${this.baseURL}/active/by-question`, { params });
      return this.transformSession(response.data);
    } catch (error) {
      console.error('Failed to get active session by question:', error);
      throw this.handleError(error);
    }
  }

  /**
   * List user's sessions
   */
  async listSessions(limit = 10, includeActive = true) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: { limit, include_active: includeActive }
      });
      return Array.isArray(response.data) 
        ? response.data.map(session => this.transformSession(session))
        : response.data;
    } catch (error) {
      console.error('Failed to list sessions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add an event to a session
   */
  async addSessionEvent(sessionId, eventType, data = {}) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/${sessionId}/events`, {
        session_id: sessionId,
        event_type: eventType,
        data,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add session event:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add a code snapshot to a session
   */
  async addCodeSnapshot(sessionId, code, language = 'python', isCurrent = false) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/${sessionId}/code-snapshot`, {
        session_id: sessionId,
        code,
        language,
        is_current: isCurrent,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add code snapshot:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update the current code state for a session
   */
  async updateCurrentCode(sessionId, code, language = 'python') {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/${sessionId}/current-code`, {
        session_id: sessionId,
        code,
        language,
        is_current: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update current code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get the current code state for a session
   */
  async getCurrentCode(sessionId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/${sessionId}/current-code`);
      return response.data;
    } catch (error) {
      console.error('Failed to get current code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get session recovery data including current code
   */
  async getSessionRecoveryData(sessionId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/${sessionId}/recovery`);
      return response.data;
    } catch (error) {
      console.error('Failed to get session recovery data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    const message = error.response?.data?.detail || error.message || 'Unknown error occurred';
    const statusCode = error.response?.status || 500;
    
    return {
      message,
      statusCode,
      originalError: error
    };
  }

  /**
   * Sync frontend session with backend
   */
  async syncSession(localSession) {
    try {
      if (!localSession?.id) {
        return null;
      }

      // Try to get the session from backend
      const backendSession = await this.getSession(localSession.id);
      
      // Check if states are different
      if (backendSession && backendSession.state !== localSession.state) {
        console.log('Session state mismatch, syncing...', {
          local: localSession.state,
          backend: backendSession.state
        });
        return backendSession;
      }

      return backendSession;
    } catch (error) {
      // If session not found, it might have expired or been cleaned up
      if (error.statusCode === 404) {
        console.log('Session not found in backend, might have expired');
        return null;
      }
      throw error;
    }
  }

  /**
   * Create session data for backend from frontend session config
   */
  createSessionData(sessionConfig) {
    return {
      session_id: sessionConfig.sessionId || this.generateSessionId(),
      session_type: this.mapSessionType(sessionConfig.type),
      question_id: sessionConfig.questionId ? String(sessionConfig.questionId) : null,
      question_title: sessionConfig.questionTitle,
      roadmap_id: sessionConfig.roadmapId,
      difficulty: sessionConfig.difficulty,
      programming_language: sessionConfig.language || 'python',
      config: {
        enableBehaviorTracking: sessionConfig.enableBehaviorTracking,
        enableFullscreen: sessionConfig.enableFullscreen,
        timeCommitment: sessionConfig.timeCommitment,
        userAgreements: sessionConfig.userAgreements
      },
      behavior_session_id: sessionConfig.behaviorSessionId
    };
  }

  /**
   * Map frontend session types to backend types
   */
  mapSessionType(frontendType) {
    const typeMap = {
      'practice': 'practice',
      'daily_challenge': 'daily_challenge',
      'roadmap_challenge': 'roadmap_challenge',
      'assessment': 'assessment'
    };
    return typeMap[frontendType] || 'practice';
  }

  /**
   * Generate a session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const sessionAPI = new SessionAPI();
export default sessionAPI;
