import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionPanel from './QuestionPanel';
import CodeEditor from './CodeEditor';
import ProfileDropdown from '../ProfileDropdown';
import AIAssistantOrb from '../ui/AIAssistantOrb';
import FullscreenExitModal from './FullscreenExitModal';
import { sampleQuestions } from '../../data/codingQuestions';

/**
 * CodingInterface - LeetCode-like coding interface
 * Layout: Question panel on left, code editor on right
 */
const CodingInterface = ({ questionId: initialQuestionId = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionConfig = location.state?.sessionConfig;
  const challengeType = location.state?.challengeType;
  const specificProblemId = location.state?.specificProblemId;
  
  // Determine initial question ID based on route state or prop
  const getInitialQuestionId = () => {
    if (specificProblemId) return specificProblemId;
    if (initialQuestionId) return initialQuestionId;
    return sampleQuestions.length > 0 ? sampleQuestions[0].id : null;
  };
  
  const [selectedQuestionId, setSelectedQuestionId] = useState(getInitialQuestionId());
  const [language, setLanguage] = useState('python');
  const [isFullscreen, setIsFullscreen] = useState(sessionConfig?.fullscreenActivated || false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [userTriedToExit, setUserTriedToExit] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const [hasWindowFocus, setHasWindowFocus] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isAttemptingReturn, setIsAttemptingReturn] = useState(false);
  
  // Refs for cleanup and timing
  const retryTimeoutRef = useRef(null);
  const enforcementIntervalRef = useRef(null);
  const lastUserActionRef = useRef(Date.now());
  const lastAttemptRef = useRef(0);

  const selectedQuestion = sampleQuestions.find(q => q.id === selectedQuestionId);

  const handleQuestionChange = (questionId) => {
    setSelectedQuestionId(questionId);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // Check if currently in fullscreen (utility function)
  const getCurrentFullscreenState = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }, []);

  // Check if user is considered "present" (tab visible and window focused)
  const isUserPresent = useCallback(() => {
    return isTabVisible && hasWindowFocus;
  }, [isTabVisible, hasWindowFocus]);

  // Clear all retry timers
  const clearRetryTimers = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (enforcementIntervalRef.current) {
      clearInterval(enforcementIntervalRef.current);
      enforcementIntervalRef.current = null;
    }
  }, []);

  // Robust auto-return to fullscreen with intelligent retry logic
  const attemptFullscreenReturn = useCallback(async () => {
    if (!sessionConfig?.fullscreenActivated || userTriedToExit || isPermissionDenied || isAttemptingReturn) {
      return false;
    }

    // Don't attempt if user is not present or if already in fullscreen
    if (!isUserPresent() || getCurrentFullscreenState()) {
      setRetryCount(0);
      setIsPermissionDenied(false);
      return getCurrentFullscreenState();
    }

    // Prevent spam - minimum 3 seconds between attempts
    const now = Date.now();
    if (now - lastAttemptRef.current < 3000) {
      return false;
    }
    lastAttemptRef.current = now;

    setIsAttemptingReturn(true);
    console.log(`Attempting fullscreen return (attempt ${retryCount + 1})`);
    
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
      
      // Success
      setRetryCount(0);
      setIsPermissionDenied(false);
      setUserTriedToExit(false);
      setIsAttemptingReturn(false);
      return true;
    } catch (error) {
      console.warn(`Fullscreen attempt ${retryCount + 1} failed:`, error);
      setIsAttemptingReturn(false);
      
      // Check if it's a permission error
      if (error.message.includes('Permission') || error.message.includes('denied') || error.name === 'NotAllowedError') {
        setIsPermissionDenied(true);
        console.warn('Fullscreen permission denied - stopping attempts');
        return false;
      }
      
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // More conservative retry with longer delays (max 3 attempts)
      if (newRetryCount < 3) {
        const delay = Math.min(5000 * Math.pow(2, newRetryCount), 30000); // 10s, 20s, 30s
        retryTimeoutRef.current = setTimeout(() => {
          attemptFullscreenReturn();
        }, delay);
      } else {
        console.warn('Max fullscreen retry attempts reached - giving up');
        setIsPermissionDenied(true);
      }
      
      return false;
    }
  }, [sessionConfig?.fullscreenActivated, userTriedToExit, isPermissionDenied, isAttemptingReturn, isUserPresent, getCurrentFullscreenState, retryCount]);

  // Standard fullscreen entry (for manual calls)
  const enterFullscreen = useCallback(async () => {
    clearRetryTimers();
    setRetryCount(0);
    setIsPermissionDenied(false); // Reset permission state on manual entry
    setIsAttemptingReturn(false);
    lastUserActionRef.current = Date.now();
    
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
      // Don't set state here - let the event listener handle it
      setUserTriedToExit(false);
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
      // Fallback to CSS fullscreen only if API is not supported
      setIsFullscreen(true);
    }
  }, [clearRetryTimers]);

  const exitFullscreen = useCallback(async () => {
    clearRetryTimers();
    lastUserActionRef.current = Date.now();
    
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      } else {
        throw new Error('Exit fullscreen API not supported');
      }
      // Don't set state here - let the event listener handle it
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error);
      // Only set state if API call failed
      setIsFullscreen(false);
    }
  }, [clearRetryTimers]);

  // Start fullscreen enforcement (runs periodically to check if we need to return)
  const startFullscreenEnforcement = useCallback(() => {
    if (!sessionConfig?.fullscreenActivated || enforcementIntervalRef.current || isPermissionDenied) {
      return;
    }

    enforcementIntervalRef.current = setInterval(() => {
      // Only attempt if user tried to exit more than 10 seconds ago (avoid spam)
      const timeSinceLastAction = Date.now() - lastUserActionRef.current;
      const timeSinceLastAttempt = Date.now() - lastAttemptRef.current;
      
      if (timeSinceLastAction > 10000 && 
          timeSinceLastAttempt > 5000 && 
          !userTriedToExit && 
          !isPermissionDenied && 
          !isAttemptingReturn &&
          isUserPresent() && 
          !getCurrentFullscreenState()) {
        attemptFullscreenReturn();
      }
    }, 10000); // Check every 10 seconds (much less aggressive)
  }, [sessionConfig?.fullscreenActivated, userTriedToExit, isPermissionDenied, isAttemptingReturn, isUserPresent, getCurrentFullscreenState, attemptFullscreenReturn]);

  // Stop fullscreen enforcement
  const stopFullscreenEnforcement = useCallback(() => {
    clearRetryTimers();
    setRetryCount(0);
    setIsPermissionDenied(false);
    setIsAttemptingReturn(false);
  }, [clearRetryTimers]);

  const toggleFullscreen = useCallback(() => {
    const currentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (currentlyFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      // Check if this is an unexpected exit (user pressed Esc, not intentional)
      const wasFullscreen = isFullscreen;
      const isUnexpectedExit = wasFullscreen && !isCurrentlyFullscreen && !userTriedToExit;

      // Update the fullscreen state first
      setIsFullscreen(isCurrentlyFullscreen);

      // Show modal only for unexpected exits during focused sessions
      if (isUnexpectedExit && sessionConfig?.fullscreenActivated) {
        setShowExitModal(true);
        // Start enforcement to try to get back to fullscreen
        startFullscreenEnforcement();
      }

      // Reset user exit flag when entering fullscreen and stop any enforcement
      if (!wasFullscreen && isCurrentlyFullscreen) {
        setUserTriedToExit(false);
        setRetryCount(0);
        clearRetryTimers();
        setShowExitModal(false);
      }

      // Start enforcement when focused session begins in fullscreen
      if (sessionConfig?.fullscreenActivated && isCurrentlyFullscreen && !userTriedToExit) {
        startFullscreenEnforcement();
      }
    };

    // Add all browser-specific event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, userTriedToExit, sessionConfig?.fullscreenActivated, startFullscreenEnforcement, clearRetryTimers]);

  // Auto-enter fullscreen if session config requires it
  useEffect(() => {
    let timeoutId;
    
    if (sessionConfig?.fullscreenActivated) {
      const currentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      if (!currentlyFullscreen) {
        timeoutId = setTimeout(() => {
          enterFullscreen();
        }, 1000); // Small delay to let the component render
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sessionConfig?.fullscreenActivated, enterFullscreen]);

  // Track tab visibility (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      // When user returns to tab, attempt fullscreen if needed (but less aggressively)
      if (isVisible && sessionConfig?.fullscreenActivated && !userTriedToExit && !isPermissionDenied) {
        // Longer delay to let browser finish tab switch and avoid spam
        setTimeout(() => {
          if (!getCurrentFullscreenState() && isUserPresent() && !isAttemptingReturn) {
            attemptFullscreenReturn();
          }
        }, 2000); // Increased delay
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionConfig?.fullscreenActivated, userTriedToExit, isPermissionDenied, isAttemptingReturn, getCurrentFullscreenState, isUserPresent, attemptFullscreenReturn]);

  // Track window focus (for app switching detection)
  useEffect(() => {
    const handleFocus = () => {
      setHasWindowFocus(true);
      lastUserActionRef.current = Date.now();
      
      // When user returns to window, attempt fullscreen if needed (but less aggressively)
      if (sessionConfig?.fullscreenActivated && !userTriedToExit && !isPermissionDenied) {
        // Longer delay to let browser finish focus and avoid spam
        setTimeout(() => {
          if (!getCurrentFullscreenState() && isUserPresent() && !isAttemptingReturn) {
            attemptFullscreenReturn();
          }
        }, 1500); // Increased delay
      }
    };

    const handleBlur = () => {
      setHasWindowFocus(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [sessionConfig?.fullscreenActivated, userTriedToExit, isPermissionDenied, isAttemptingReturn, getCurrentFullscreenState, isUserPresent, attemptFullscreenReturn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFullscreenEnforcement();
    };
  }, [stopFullscreenEnforcement]);

  // Track user activity to determine if they're actively using the page
  useEffect(() => {
    let throttleTimeout = null;
    
    const updateUserActivity = () => {
      // Throttle activity updates to avoid excessive calls
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          lastUserActionRef.current = Date.now();
          throttleTimeout = null;
        }, 1000); // Only update once per second
      }
    };

    // Reduced set of events to track
    const events = ['keypress', 'click', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, updateUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateUserActivity, true);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // F11 key - toggle fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        setUserTriedToExit(true);
        toggleFullscreen();
      }
      
      // Escape key - let the browser handle it naturally
      // The fullscreen change handler will detect the exit and show modal if needed
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen]);

  // Modal handlers
  const handleContinueSession = useCallback(async () => {
    setShowExitModal(false);
    setUserTriedToExit(false);
    setRetryCount(0);
    setIsPermissionDenied(false); // Reset permission state when user manually continues
    setIsAttemptingReturn(false);
    await enterFullscreen();
    startFullscreenEnforcement();
  }, [enterFullscreen, startFullscreenEnforcement]);

  const handleEndSession = useCallback(async () => {
    setShowExitModal(false);
    setUserTriedToExit(true);
    stopFullscreenEnforcement();
    
    // Ensure we exit fullscreen first
    if (getCurrentFullscreenState()) {
      await exitFullscreen();
    }
    
    // Navigate back to dashboard
    navigate('/dashboard');
  }, [exitFullscreen, navigate, getCurrentFullscreenState, stopFullscreenEnforcement]);

  // Format elapsed time - memoized to prevent unnecessary recalculations
  const getFormattedElapsedTime = useCallback(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [sessionStartTime]);

  // Session info for modal - only updates when modal is visible
  const sessionInfo = useMemo(() => ({
    problemTitle: selectedQuestion?.title || 'Coding Challenge',
    timeElapsed: showExitModal ? getFormattedElapsedTime() : '00:00',
    language: language.charAt(0).toUpperCase() + language.slice(1),
    challengeType: challengeType || 'Practice'
  }), [selectedQuestion?.title, showExitModal, getFormattedElapsedTime, language, challengeType]);


  if (!selectedQuestion) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-zinc-100 mb-2">No Questions Available</h2>
          <p className="text-zinc-400">Please add some coding questions to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} flex flex-col`}>
      {/* Header - Acts as Navbar */}
      <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-3 flex items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-lg font-medium text-zinc-100">IntelliCode</h1>
        </div>

        {/* Center Section - AI Assistant */}
        <div className="flex justify-center">
          <div className="relative group">
            <AIAssistantOrb size="md" isActive={true} />
            {/* Hover Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {/* Tooltip Arrow */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-zinc-700"></div>
              <div className="text-center">
                <div className="font-medium text-blue-400">AI Assistant</div>
                <div className="text-zinc-300 mt-0.5">Ready to help with coding</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="
                bg-zinc-700 text-zinc-100 text-sm px-3 py-1 rounded border border-zinc-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              setUserTriedToExit(true);
              toggleFullscreen();
            }}
            className="
              p-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
            "
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel - Left Side */}
        <div className="w-1/2 border-r border-zinc-700 overflow-hidden">
          <QuestionPanel 
            question={selectedQuestion}
            onQuestionChange={handleQuestionChange}
            availableQuestions={sampleQuestions}
          />
        </div>

        {/* Code Editor Panel - Right Side */}
        <div className="w-1/2 overflow-hidden">
          <CodeEditor
            question={selectedQuestion}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Fullscreen Exit Modal */}
      <FullscreenExitModal
        isVisible={showExitModal}
        onContinue={handleContinueSession}
        onEndSession={handleEndSession}
        sessionInfo={sessionInfo}
      />
    </div>
  );
};

export default CodingInterface;
