import useAxios from '../hooks/useAxios';

/**
 * Behavior Tracking API service hooks
 * Handles keystroke dynamics and coding behavior analytics
 */

// Session Management
export const useStartTrackingSession = () => useAxios('/behavior/session/start', { 
  method: 'POST', 
  immediate: false 
});

export const useEndTrackingSession = (sessionId) => useAxios(`/behavior/session/${sessionId}/end`, { 
  method: 'POST', 
  immediate: false 
});

// Keystroke Events
export const useAddKeystroke = () => useAxios('/behavior/keystroke', { 
  method: 'POST', 
  immediate: false 
});

export const useAddKeystrokeBatch = () => useAxios('/behavior/keystroke/batch', { 
  method: 'POST', 
  immediate: false 
});

// Live Metrics
export const useGetLiveMetrics = (sessionId) => useAxios(`/behavior/session/${sessionId}/live`, { 
  method: 'GET',
  immediate: false,
  deps: [sessionId]
});

// Session Analytics
export const useGetSessionAnalytics = (sessionId) => useAxios(`/behavior/session/${sessionId}/analytics`, { 
  method: 'GET',
  immediate: false,
  deps: [sessionId]
});

// User Insights
export const useGetBehaviorInsights = () => useAxios('/behavior/insights', { 
  method: 'GET', 
  immediate: false 
});

export const useGetRecentSessions = () => useAxios('/behavior/sessions/recent', { 
  method: 'GET', 
  immediate: false 
});

// Privacy Controls
export const useGetPrivacyControls = () => useAxios('/behavior/privacy', { 
  method: 'GET', 
  immediate: false 
});

export const useUpdatePrivacyControls = () => useAxios('/behavior/privacy', { 
  method: 'POST', 
  immediate: false 
});

// Behavior Events (for future expansion)
export const useAddBehaviorEvent = () => useAxios('/behavior/behavior/event', { 
  method: 'POST', 
  immediate: false 
});

/**
 * Behavior Tracking Service Class
 * Main service for managing behavior tracking sessions and events
 */
export class BehaviorTrackingService {
  constructor() {
    this.currentSession = null;
    this.isTracking = false;
    this.eventBuffer = [];
    this.bufferSize = 20; // Send events in batches of 20 (reduced API calls)
    this.bufferTimeout = 5000; // Send events every 5 seconds (better performance)
    this.bufferTimer = null;
    this.listeners = new Set();
    this.privacySettings = {
      trackingEnabled: true,
      anonymizeData: true
    };
    this.isStarting = false; // Prevent concurrent start attempts
    this.lastStartAttempt = 0; // Debounce start attempts
  }

  /**
   * Start a new behavior tracking session
   */
  async startSession(questionKey = null, apiHooks) {
    // Prevent concurrent start attempts
    if (this.isStarting) {
      console.warn('Session start already in progress');
      return null;
    }

    // Debounce rapid start attempts
    const now = Date.now();
    if (now - this.lastStartAttempt < 1000) {
      console.warn('Start attempt too soon, debouncing');
      return null;
    }
    this.lastStartAttempt = now;

    if (this.isTracking) {
      console.warn('Behavior tracking session already active');
      return this.currentSession?.sessionId;
    }

    this.isStarting = true;

    try {
      const { startSessionHook } = apiHooks;
      const response = await startSessionHook.execute({
        question_key: questionKey ? String(questionKey) : null, // Ensure it's a string
        session_config: {
          buffer_size: this.bufferSize,
          buffer_timeout: this.bufferTimeout
        }
      });

      if (response && response.session_id) {
        this.currentSession = {
          sessionId: response.session_id,
          startTime: new Date(),
          questionKey: questionKey,
          trackingEnabled: response.tracking_enabled,
          privacyMode: response.privacy_mode
        };

        this.isTracking = true;
        this.eventBuffer = [];
        this.startBufferTimer(apiHooks);
        
        console.log('Behavior tracking session started:', this.currentSession.sessionId);
        this.notifyListeners('sessionStarted', this.currentSession);
        
        return this.currentSession.sessionId;
      }
    } catch (error) {
      console.error('Failed to start behavior tracking session:', error);
      if (error.response?.data) {
        console.error('Backend validation error details:', error.response.data);
      }
      
      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        console.warn('Behavior tracking disabled: User not authenticated');
        this.privacySettings.trackingEnabled = false;
        this.notifyListeners('authenticationRequired', { message: 'Please log in to enable behavior tracking' });
        return null; // Don't throw, just disable tracking
      }
      
      // Handle validation errors
      if (error.response?.status === 422) {
        console.warn('Behavior tracking disabled: Validation error');
        this.notifyListeners('validationError', { 
          message: 'Behavior tracking temporarily unavailable',
          details: error.response.data 
        });
        return null; // Don't throw, just disable tracking
      }
      
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * End the current behavior tracking session
   */
  async endSession(apiHooks) {
    if (!this.isTracking || !this.currentSession) {
      console.warn('No active behavior tracking session to end');
      return;
    }

    try {
      // Flush remaining events
      await this.flushEventBuffer(apiHooks);
      
      // Clear timer
      if (this.bufferTimer) {
        clearTimeout(this.bufferTimer);
        this.bufferTimer = null;
      }

      // Make direct API call since we need session ID in URL
      const { addKeystrokeBatchHook } = apiHooks; // Get axios instance from any hook
      const axiosInstance = addKeystrokeBatchHook.axiosInstance || 
                           (await import('../utils/axios.js')).default;
      
      await axiosInstance.post(`/behavior/session/${this.currentSession.sessionId}/end`, {
        end_timestamp: new Date().toISOString()
      }, {
        timeout: 5000  // Shorter timeout for session end
      });

      const endedSession = { ...this.currentSession };
      this.currentSession = null;
      this.isTracking = false;
      this.eventBuffer = [];

      console.log('Behavior tracking session ended:', endedSession.sessionId);
      this.notifyListeners('sessionEnded', endedSession);

      return endedSession;
    } catch (error) {
      console.error('Failed to end behavior tracking session:', error);
      
      // Don't throw error during cleanup to prevent React loops
      // Just clean up the local state
      const endedSession = { ...this.currentSession };
      this.currentSession = null;
      this.isTracking = false;
      this.eventBuffer = [];
      
      console.log('Session cleaned up locally despite API error');
      this.notifyListeners('sessionEnded', endedSession);
      
      return endedSession;
    }
  }

  /**
   * Record a keystroke event
   */
  recordKeystroke(event) {
    if (!this.isTracking || !this.currentSession || !this.privacySettings.trackingEnabled) {
      return;
    }

    const keystrokeEvent = {
      session_id: this.currentSession.sessionId,
      question_key: this.currentSession.questionKey,
      timestamp: new Date().toISOString(),
      key_pressed: event.key,
      key_code: event.keyCode || event.which,
      is_printable: this.isPrintableKey(event.key),
      cursor_position: this.getCursorPosition(event.target),
      text_length: event.target?.value?.length || 0
    };

    // Add to buffer
    this.eventBuffer.push(keystrokeEvent);
    this.notifyListeners('keystrokeRecorded', keystrokeEvent);

    // Send immediately if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flushEventBuffer();
    }
  }

  /**
   * Record a behavior event (for future expansion)
   */
  recordBehaviorEvent(eventType, metadata = {}, duration = null) {
    if (!this.isTracking || !this.currentSession || !this.privacySettings.trackingEnabled) {
      return;
    }

    const behaviorEvent = {
      session_id: this.currentSession.sessionId,
      question_key: this.currentSession.questionKey,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      duration: duration,
      metadata: metadata
    };

    this.notifyListeners('behaviorEventRecorded', behaviorEvent);
    
    // For now, just log behavior events
    // In the future, these will be sent to the backend
    console.log('Behavior event recorded:', behaviorEvent);
  }

  /**
   * Get live metrics for the current session
   */
  async getLiveMetrics(apiHooks) {
    if (!this.currentSession) {
      return null;
    }

    try {
      const { getLiveMetricsHook } = apiHooks;
      const metrics = await getLiveMetricsHook.execute(this.currentSession.sessionId);
      this.notifyListeners('liveMetricsUpdated', metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to get live metrics:', error);
      return null;
    }
  }

  /**
   * Flush event buffer to backend
   */
  async flushEventBuffer(apiHooks) {
    if (this.eventBuffer.length === 0 || !this.currentSession) {
      return;
    }

    try {
      const { addKeystrokeBatchHook } = apiHooks;
      await addKeystrokeBatchHook.execute({
        session_id: this.currentSession.sessionId,
        events: [...this.eventBuffer] // Copy array
      });

      const flushedCount = this.eventBuffer.length;
      this.eventBuffer = [];
      this.notifyListeners('eventsFlushed', { count: flushedCount });
      
      console.log(`Flushed ${flushedCount} events to backend`);
    } catch (error) {
      console.warn('Failed to flush event buffer:', error);
      // Clear buffer after 3 failed attempts to prevent memory buildup
      if (this.eventBuffer.length > 30) {
        console.warn('Clearing event buffer due to repeated failures');
        this.eventBuffer = [];
      }
    }
  }

  /**
   * Start buffer timer for periodic flushing
   */
  startBufferTimer(apiHooks) {
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
    }

    this.bufferTimer = setTimeout(async () => {
      await this.flushEventBuffer(apiHooks);
      if (this.isTracking) {
        this.startBufferTimer(apiHooks); // Recursive timer
      }
    }, this.bufferTimeout);
  }

  /**
   * Utility: Check if a key is printable
   */
  isPrintableKey(key) {
    return key.length === 1 || // Single character keys
           ['Space', 'Tab', 'Enter'].includes(key);
  }

  /**
   * Utility: Get cursor position from editor
   */
  getCursorPosition(element) {
    if (!element) return null;

    try {
      // For Monaco Editor
      if (element.monaco && element.monaco.getPosition) {
        const position = element.monaco.getPosition();
        return {
          line: position.lineNumber,
          column: position.column
        };
      }

      // For regular textarea/input
      const selectionStart = element.selectionStart;
      const textBeforeCursor = element.value.substring(0, selectionStart);
      const lines = textBeforeCursor.split('\n');
      
      return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1
      };
    } catch (error) {
      console.warn('Could not get cursor position:', error);
      return null;
    }
  }

  /**
   * Event listener management
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Error in behavior tracking listener:', error);
      }
    });
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings) {
    this.privacySettings = { ...this.privacySettings, ...settings };
    this.notifyListeners('privacySettingsUpdated', this.privacySettings);
  }

  /**
   * Get current session info
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive() {
    return this.isTracking && this.currentSession !== null;
  }
}

// Export singleton instance
export const behaviorTracker = new BehaviorTrackingService();
