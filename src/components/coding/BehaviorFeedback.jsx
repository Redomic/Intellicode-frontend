import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * BehaviorFeedback - Development-only behavior tracking metrics
 * Only visible in development mode for backend analysis
 */
const BehaviorFeedback = ({ 
  isVisible = true, 
  analyzer = null, 
  behaviorTracker = null,
  position = 'bottom-right',
  compact = false 
}) => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [metrics, setMetrics] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('active');
  const updateIntervalRef = useRef(null);

  // Update metrics from analyzer (development only - no suggestions)
  const updateMetrics = useCallback(() => {
    if (analyzer) {
      const newMetrics = analyzer.getMetrics();
      setMetrics(newMetrics);
    }
  }, [analyzer]);

  // Setup update interval
  useEffect(() => {
    if (analyzer && isVisible) {
      updateMetrics(); // Initial update
      updateIntervalRef.current = setInterval(updateMetrics, 5000); // Update every 5 seconds
      
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

  if (!isVisible || !metrics) {
    return null;
  }

  // Minimal development-only display
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-zinc-300">Dev Metrics</span>
          </div>
          <span className="text-xs text-zinc-500">
            Status: {trackingStatus}
          </span>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Speed:</span>
            <span className="text-zinc-200 font-mono">
              {Math.round(metrics.typingSpeed?.cpm || 0)} CPM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Accuracy:</span>
            <span className="text-zinc-200 font-mono">
              {Math.round(metrics.accuracy?.percentage || 0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Flow:</span>
            <span className="text-zinc-200 font-mono">
              {metrics.productivity?.flowState ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorFeedback;