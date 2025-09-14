import { useState, useEffect, useRef, useCallback } from 'react';
import { behaviorTracker } from '../services/behaviorTracking';
import { KeystrokeAnalyzer } from '../utils/keystrokeAnalyzer';
import {
  useStartTrackingSession,
  useEndTrackingSession,
  useAddKeystroke,
  useAddKeystrokeBatch,
  useGetLiveMetrics
} from '../services/behaviorTracking';

/**
 * Custom hook for behavior tracking integration
 * Manages tracking session, keystroke analysis, and live feedback
 */
const useBehaviorTracking = (options = {}) => {
  const {
    autoStart = false,
    questionKey = null,
    trackingEnabled = true,
    bufferSize = 10,
    bufferTimeout = 2000,
    analysisOptions = {}
  } = options;

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const analyzerRef = useRef(null);
  const metricsIntervalRef = useRef(null);
  const lastKeystrokeRef = useRef(null);
  const autoStartAttemptedRef = useRef(false);

  // API hooks
  const startSessionHook = useStartTrackingSession();
  const addKeystrokeHook = useAddKeystroke();
  const addKeystrokeBatchHook = useAddKeystrokeBatch();
  const getLiveMetricsHook = useGetLiveMetrics();

  // Initialize analyzer
  useEffect(() => {
    if (!analyzerRef.current) {
      analyzerRef.current = new KeystrokeAnalyzer({
        pauseThreshold: 500,
        burstThreshold: 150,
        flowStateThreshold: 40,
        analysisWindow: 60000,
        ...analysisOptions
      });
      setIsInitialized(true);
    }
  }, [analysisOptions]);

  // Start tracking session
  const startTracking = useCallback(async (sessionQuestionKey = questionKey) => {
    console.log('startTracking called:', { isTracking, trackingEnabled, sessionQuestionKey, questionKey });
    
    if (isTracking || !trackingEnabled) {
      console.log('Start tracking skipped - already tracking or disabled');
      return currentSession?.sessionId;
    }

    try {
      setError(null);
      console.log('Starting behavior tracking session...');
      
      const apiHooks = {
        startSessionHook,
        addKeystrokeBatchHook
      };

      const sessionId = await behaviorTracker.startSession(
        sessionQuestionKey ? String(sessionQuestionKey) : null, 
        apiHooks
      );
      
      console.log('Session started with ID:', sessionId);
      
      if (sessionId) {
        const session = behaviorTracker.getCurrentSession();
        setCurrentSession(session);
        setIsTracking(true);
        
        // Reset analyzer for new session
        if (analyzerRef.current) {
          analyzerRef.current.reset();
        }
        
        // Start live metrics polling
        startLiveMetricsPolling(sessionId);
        
        console.log('Behavior tracking started:', sessionId);
        return sessionId;
      }
    } catch (err) {
      console.error('Failed to start behavior tracking:', err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Authentication required for behavior tracking');
      } else if (err.response?.status === 422) {
        setError('Behavior tracking temporarily unavailable');
      } else {
        setError(err.message);
      }
      // Don't retry automatically to prevent loops
    }
  }, [isTracking, trackingEnabled, currentSession?.sessionId, questionKey]);

  // End tracking session
  const endTracking = useCallback(async () => {
    if (!isTracking || !currentSession) {
      return;
    }

    try {
      setError(null);
      
      const apiHooks = {
        startSessionHook,
        addKeystrokeBatchHook
      };

      await behaviorTracker.endSession(apiHooks);
      
      setIsTracking(false);
      setCurrentSession(null);
      setLiveMetrics(null);
      
      // Stop live metrics polling
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }
      
      console.log('Behavior tracking ended');
    } catch (err) {
      console.error('Failed to end behavior tracking:', err);
      setError(err.message);
      
      // Clean up state even if API call failed to prevent React loops
      setIsTracking(false);
      setCurrentSession(null);
      setLiveMetrics(null);
      
      // Stop live metrics polling
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }
    }
  }, [isTracking, currentSession]);

  // Record keystroke event
  const recordKeystroke = useCallback((event) => {
    if (!trackingEnabled) {
      return;
    }
    
    // Log for debugging
    console.log('Recording keystroke:', event.key, 'isTracking:', isTracking, 'analyzerReady:', !!analyzerRef.current);

    try {
      // Always record in behavior tracker (for backend) - it has its own checks
      if (isTracking) {
        behaviorTracker.recordKeystroke(event);
      }
      
      // Process in analyzer (for live feedback) - only if analyzer is ready
      if (analyzerRef.current) {
        const processedEvent = {
          timestamp: new Date().toISOString(),
          key_pressed: event.key,
          key_code: event.keyCode || event.which,
          is_printable: analyzerRef.current.isPrintableKey(event.key),
          cursor_position: null, // Will be populated by behavior tracker
          text_length: event.target?.value?.length || 0
        };
        
        analyzerRef.current.addKeystroke(processedEvent);
        lastKeystrokeRef.current = processedEvent;
      }
      
    } catch (err) {
      console.error('Failed to record keystroke:', err);
      setError(err.message);
    }
  }, [isTracking, trackingEnabled]);

  // Start live metrics polling
  const startLiveMetricsPolling = useCallback((sessionId) => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }

    metricsIntervalRef.current = setInterval(async () => {
      try {
        // Get backend metrics
        const backendMetrics = await getLiveMetricsHook.execute(sessionId);
        
        // Get analyzer metrics
        const analyzerMetrics = analyzerRef.current ? analyzerRef.current.getMetrics() : null;
        
        // Combine metrics
        const combinedMetrics = {
          backend: backendMetrics,
          analyzer: analyzerMetrics,
          timestamp: new Date().toISOString()
        };
        
        setLiveMetrics(combinedMetrics);
      } catch (err) {
        console.warn('Failed to get live metrics:', err);
      }
    }, 10000); // Poll every 10 seconds (reduced for better performance)
  }, [getLiveMetricsHook]);

  // Auto-start if requested (with safety guard)
  useEffect(() => {
    if (autoStart && !isTracking && trackingEnabled && !autoStartAttemptedRef.current) {
      autoStartAttemptedRef.current = true;
      console.log('Auto-starting behavior tracking...');
      startTracking().catch(err => {
        console.warn('Auto-start failed:', err);
        // Reset flag after a delay to allow retry
        setTimeout(() => {
          autoStartAttemptedRef.current = false;
        }, 5000);
      });
    }
  }, [autoStart, isTracking, trackingEnabled]);

  // Cleanup on unmount - only in production to avoid React strict mode issues
  useEffect(() => {
    return () => {
      // Always clean up metrics polling
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      
      // Only auto-end sessions in production to avoid development mode issues
      if (process.env.NODE_ENV === 'production' && isTracking) {
        endTracking();
      }
    };
  }, [isTracking, endTracking]);

  // Setup behavior tracker event listeners
  useEffect(() => {
    const handleBehaviorEvent = (eventType, data) => {
      switch (eventType) {
        case 'sessionStarted':
          setCurrentSession(data);
          setIsTracking(true);
          break;
        case 'sessionEnded':
          setCurrentSession(null);
          setIsTracking(false);
          setLiveMetrics(null);
          break;
        case 'error':
          setError(data.message);
          break;
        default:
          break;
      }
    };

    behaviorTracker.addListener(handleBehaviorEvent);
    
    return () => {
      behaviorTracker.removeListener(handleBehaviorEvent);
    };
  }, []);

  // Add page unload handler to end sessions (works in both dev and production)
  useEffect(() => {
    const handlePageUnload = () => {
      if (isTracking && currentSession?.sessionId) {
        // Use sendBeacon for reliable session ending on page unload
        const endpoint = `${window.location.origin}/behavior/session/${currentSession.sessionId}/end`;
        const payload = JSON.stringify({ end_timestamp: new Date().toISOString() });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, payload);
        }
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('pagehide', handlePageUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
      window.removeEventListener('pagehide', handlePageUnload);
    };
  }, [isTracking, currentSession?.sessionId]);

  // Get current analyzer metrics
  const getAnalyzerMetrics = useCallback(() => {
    return analyzerRef.current ? analyzerRef.current.getMetrics() : null;
  }, []);

  // Get analyzer insights
  const getInsights = useCallback(() => {
    return analyzerRef.current ? analyzerRef.current.getInsights() : { insights: [], suggestions: [] };
  }, []);

  // Export session data
  const exportSessionData = useCallback(() => {
    return analyzerRef.current ? analyzerRef.current.exportSessionData() : null;
  }, []);

  // Toggle tracking
  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      await endTracking();
    } else {
      await startTracking();
    }
  }, [isTracking, startTracking, endTracking]);

  // Update privacy settings
  const updatePrivacySettings = useCallback((settings) => {
    behaviorTracker.updatePrivacySettings(settings);
  }, []);

  return {
    // State
    isTracking,
    currentSession,
    liveMetrics,
    error,
    isInitialized,
    
    // Actions
    startTracking,
    endTracking,
    toggleTracking,
    recordKeystroke,
    updatePrivacySettings,
    
    // Manual cleanup (useful in development)
    forceEndSession: () => {
      if (isTracking) {
        endTracking();
      }
    },
    
    // Data access
    getAnalyzerMetrics,
    getInsights,
    exportSessionData,
    analyzer: analyzerRef.current,
    
    // API loading states
    isStartingSession: startSessionHook.loading,
    
    // Behavior tracker instance (for advanced usage)
    behaviorTracker
  };
};

export default useBehaviorTracking;
