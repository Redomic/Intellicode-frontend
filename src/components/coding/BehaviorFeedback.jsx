import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * BehaviorFeedback - Development-only behavior tracking metrics
 * Only visible in development mode for backend analysis
 */
const BehaviorFeedback = ({ 
  isVisible = true, 
  analyzer = null, 
  behaviorTracker = null,
  liveMetrics: propLiveMetrics = null,
  position = 'bottom-right',
  compact = false 
}) => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [metrics, setMetrics] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('active');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('analyzer');
  const updateIntervalRef = useRef(null);

  // Update metrics from analyzer (development only - no suggestions)
  const updateMetrics = useCallback(() => {
    if (analyzer) {
      const newMetrics = analyzer.getMetrics();
      setMetrics(newMetrics);
    }

    // Use prop liveMetrics if available, otherwise generate from current data
    if (propLiveMetrics) {
      setLiveMetrics(propLiveMetrics);
    } else if (behaviorTracker && behaviorTracker.currentSession) {
      try {
        // Simulated live metrics structure based on the backend API
        const sessionId = behaviorTracker.currentSession.sessionId;
        const backendMetrics = {
          session: {
            id: sessionId,
            questionKey: behaviorTracker.currentSession.questionKey,
            startTime: behaviorTracker.currentSession.startTime,
            totalKeystrokes: behaviorTracker.currentSession.keystrokeCount || 0,
            duration: Date.now() - (behaviorTracker.currentSession.startTime ? new Date(behaviorTracker.currentSession.startTime).getTime() : Date.now())
          },
          typing: {
            cpm: newMetrics?.typingSpeed?.cpm || 0,
            wpm: newMetrics?.typingSpeed?.wpm || 0,
            accuracy: newMetrics?.accuracy?.percentage || 100
          },
          behavior: {
            pauses: newMetrics?.pauses || { count: 0, averageDuration: 0, longestDuration: 0 },
            bursts: newMetrics?.bursts || { count: 0, averageLength: 0, longestLength: 0 },
            rhythm: newMetrics?.rhythm || { consistency: 0, variance: 0 },
            errors: newMetrics?.errors || { backspaceCount: 0, totalCorrections: 0 },
            productivity: newMetrics?.productivity || { score: 0, flowState: false }
          }
        };
        setLiveMetrics(backendMetrics);
      } catch (error) {
        console.warn('Failed to get live metrics:', error);
      }
    }
  }, [analyzer, behaviorTracker, propLiveMetrics]);

  // Setup update interval
  useEffect(() => {
    if (analyzer && isVisible) {
      updateMetrics(); // Initial update
      updateIntervalRef.current = setInterval(updateMetrics, 2000); // Update every 2 seconds
      
      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }
  }, [analyzer, isVisible, updateMetrics]);

  // Listen for behavior tracker events
  useEffect(() => {
    if (!behaviorTracker) return;

    const handleEvent = (eventType, data) => {
      switch (eventType) {
        case 'authenticationRequired':
          setTrackingStatus('auth-required');
          break;
        case 'validationError':
          setTrackingStatus('unavailable');
          break;
        case 'sessionStarted':
          setTrackingStatus('active');
          break;
        case 'sessionEnded':
          setTrackingStatus('active');
          break;
        default:
          break;
      }
    };

    behaviorTracker.addListener(handleEvent);
    
    return () => {
      behaviorTracker.removeListener(handleEvent);
    };
  }, [behaviorTracker]);

  if (!isVisible) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const renderCompactView = () => (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            trackingStatus === 'active' ? 'bg-green-400' : 
            trackingStatus === 'auth-required' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <span className="text-xs font-medium text-zinc-300">Dev Metrics</span>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Expand metrics"
        >
          ⇗
        </button>
      </div>
      
      {metrics ? (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Speed:</span>
            <span className="text-zinc-200 font-mono">
              {Math.round(metrics.typingSpeed?.cpm || 0)} CPM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Corrections:</span>
            <span className="text-zinc-200 font-mono">
              {metrics.errors?.totalCorrections || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Flow:</span>
            <span className="text-zinc-200 font-mono">
              {metrics.productivity?.flowState ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="sm" variant="secondary" text="Loading..." />
        </div>
      )}
    </div>
  );

  const renderExpandedView = () => (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            trackingStatus === 'active' ? 'bg-green-400' : 
            trackingStatus === 'auth-required' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <span className="text-sm font-medium text-zinc-100">Development Metrics</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-500">Status: {trackingStatus}</span>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Collapse metrics"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`flex-1 py-2 px-4 text-xs font-medium transition-colors ${
            activeTab === 'analyzer'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-zinc-800/50'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Frontend Analysis
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`flex-1 py-2 px-4 text-xs font-medium transition-colors ${
            activeTab === 'backend'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-zinc-800/50'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Backend Metrics
        </button>
        <button
          onClick={() => setActiveTab('session')}
          className={`flex-1 py-2 px-4 text-xs font-medium transition-colors ${
            activeTab === 'session'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-zinc-800/50'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Session Info
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-64">
        {activeTab === 'analyzer' && renderAnalyzerMetrics()}
        {activeTab === 'backend' && renderBackendMetrics()}
        {activeTab === 'session' && renderSessionInfo()}
      </div>
    </div>
  );

  const renderAnalyzerMetrics = () => {
    if (!metrics) {
      return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" variant="secondary" text="Loading analyzer metrics..." />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Typing Speed */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Typing Speed</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">CPM:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.typingSpeed?.cpm || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">WPM:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.typingSpeed?.wpm || 0)}</span>
            </div>
          </div>
        </div>

        {/* Error Corrections */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Error Corrections</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Backspaces:</span>
              <span className="text-zinc-200 font-mono">{metrics.errors?.backspaceCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Corrections:</span>
              <span className="text-zinc-200 font-mono">{metrics.errors?.totalCorrections || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Correction Ratio:</span>
              <span className="text-zinc-200 font-mono">{Math.round((metrics.errors?.correctionRatio || 0) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Typing Rhythm */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Typing Rhythm</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Consistency:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.rhythm?.consistency || 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Variance:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.rhythm?.variance || 0)}ms</span>
            </div>
          </div>
        </div>

        {/* Pauses & Bursts */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Typing Patterns</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Pauses:</span>
              <span className="text-zinc-200 font-mono">{metrics.pauses?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Avg Pause:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.pauses?.averageDuration || 0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Longest Pause:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.pauses?.longestDuration || 0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Bursts:</span>
              <span className="text-zinc-200 font-mono">{metrics.bursts?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Avg Burst:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.bursts?.averageLength || 0)}</span>
            </div>
          </div>
        </div>

        {/* Productivity */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Productivity</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Score:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.productivity?.score || 0)}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Flow State:</span>
              <span className={`font-mono ${metrics.productivity?.flowState ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.productivity?.flowState ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Speed Component:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.productivity?.speedComponent || 0)}/40</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Consistency:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.productivity?.consistencyComponent || 0)}/30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Error Penalty:</span>
              <span className="text-zinc-200 font-mono">{Math.round(metrics.productivity?.errorComponent || 0)}/30</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBackendMetrics = () => {
    if (!liveMetrics) {
      return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" variant="secondary" text="Loading backend metrics..." />
        </div>
      );
    }

    // Check if we have real backend metrics vs simulated ones
    const hasRealBackendMetrics = liveMetrics.backend && liveMetrics.analyzer;
    const displayMetrics = hasRealBackendMetrics ? liveMetrics.backend : liveMetrics;
    
    return (
      <div className="space-y-4">
        {/* Data Source Indicator */}
        <div className="text-xs text-zinc-500 text-center py-1 border-b border-zinc-700/50">
          {hasRealBackendMetrics ? '🌐 Live Backend Data' : '📊 Simulated Backend Data'}
        </div>

        {/* Backend Typing Stats */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Backend Typing Analysis</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">CPM:</span>
              <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.typing?.cpm || displayMetrics.cpm || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">WPM:</span>
              <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.typing?.wpm || displayMetrics.wpm || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Corrections:</span>
              <span className="text-zinc-200 font-mono">{displayMetrics.behavior?.errors?.totalCorrections || displayMetrics.total_corrections || 0}</span>
            </div>
            {hasRealBackendMetrics && displayMetrics.keystroke_dynamics && (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Dwell Time:</span>
                  <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.keystroke_dynamics.avg_dwell_time || 0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Flight Time:</span>
                  <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.keystroke_dynamics.avg_flight_time || 0)}ms</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Backend Behavior Analysis */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Behavior Analysis</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Pauses:</span>
              <span className="text-zinc-200 font-mono">{displayMetrics.behavior?.pauses?.count || displayMetrics.pause_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Bursts:</span>
              <span className="text-zinc-200 font-mono">{displayMetrics.behavior?.bursts?.count || displayMetrics.burst_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Rhythm Score:</span>
              <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.behavior?.rhythm?.consistency || displayMetrics.rhythm_score || 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Productivity:</span>
              <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.behavior?.productivity?.score || displayMetrics.productivity_score || 0)}/100</span>
            </div>
            {hasRealBackendMetrics && displayMetrics.flow_state !== undefined && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Flow State:</span>
                <span className={`font-mono ${displayMetrics.flow_state ? 'text-green-400' : 'text-red-400'}`}>
                  {displayMetrics.flow_state ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Backend Session Stats */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Session Statistics</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Keystrokes:</span>
              <span className="text-zinc-200 font-mono">{displayMetrics.session?.totalKeystrokes || displayMetrics.total_keystrokes || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Duration:</span>
              <span className="text-zinc-200 font-mono">{Math.round((displayMetrics.session?.duration || displayMetrics.session_duration || 0) / 1000)}s</span>
            </div>
            {hasRealBackendMetrics && (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Time:</span>
                  <span className="text-zinc-200 font-mono">{Math.round((displayMetrics.active_typing_time || 0) / 1000)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pause Time:</span>
                  <span className="text-zinc-200 font-mono">{Math.round((displayMetrics.total_pause_time || 0) / 1000)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Words Typed:</span>
                  <span className="text-zinc-200 font-mono">{displayMetrics.words_typed || 0}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Advanced Metrics (if available from real backend) */}
        {hasRealBackendMetrics && displayMetrics.behavioral_patterns && (
          <div>
            <h4 className="text-xs font-medium text-zinc-200 mb-2">Advanced Patterns</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Confidence:</span>
                <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.behavioral_patterns.confidence_score || 0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Stress Level:</span>
                <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.behavioral_patterns.stress_indicators || 0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Focus Score:</span>
                <span className="text-zinc-200 font-mono">{Math.round(displayMetrics.behavioral_patterns.focus_score || 0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSessionInfo = () => {
    const sessionData = liveMetrics?.session || behaviorTracker?.currentSession;
    
    if (!sessionData) {
      return (
        <div className="text-center py-8">
          <div className="text-zinc-400 text-xs">No active session</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Session Details</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Session ID:</span>
              <span className="text-zinc-200 font-mono text-right truncate max-w-32" title={sessionData.id || sessionData.sessionId}>
                {(sessionData.id || sessionData.sessionId || 'N/A').substring(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Question:</span>
              <span className="text-zinc-200 font-mono">{sessionData.questionKey || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Start Time:</span>
              <span className="text-zinc-200 font-mono">
                {sessionData.startTime ? new Date(sessionData.startTime).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Tracking Status:</span>
              <span className={`font-mono ${trackingStatus === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                {trackingStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div>
          <h4 className="text-xs font-medium text-zinc-200 mb-2">Debug Info</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Analyzer Ready:</span>
              <span className={`font-mono ${analyzer ? 'text-green-400' : 'text-red-400'}`}>
                {analyzer ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Tracker Ready:</span>
              <span className={`font-mono ${behaviorTracker ? 'text-green-400' : 'text-red-400'}`}>
                {behaviorTracker ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Update Rate:</span>
              <span className="text-zinc-200 font-mono">2s</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {compact || !isExpanded ? renderCompactView() : renderExpandedView()}
    </div>
  );
};

export default BehaviorFeedback;