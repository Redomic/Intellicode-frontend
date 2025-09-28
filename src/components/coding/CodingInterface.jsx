import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import screenfull from 'screenfull';
import QuestionPanel from './QuestionPanel';
import CodeEditor from './CodeEditor';
import ProfileDropdown from '../ProfileDropdown';
import AIAssistantOrb from '../ui/AIAssistantOrb';
import FullscreenExitModal from './FullscreenExitModal';
import SessionRecoveryModal from '../session/SessionRecoveryModal';
import SessionNavbarCounter from '../session/SessionNavbarCounter';
import { sampleQuestions } from '../../data/codingQuestions';
import useSession from '../../hooks/useSession';
import { SESSION_TYPES } from '../../services/sessionOrchestrator';

/**
 * CodingInterface - LeetCode-like coding interface
 * Layout: Question panel on left, code editor on right
 */
const CodingInterface = ({ 
  questionId: initialQuestionId = null, 
  roadmapQuestion = null, 
  roadmapId = null 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionConfig = location.state?.sessionConfig;
  const challengeType = location.state?.challengeType;
  const specificProblemId = location.state?.specificProblemId;
  
  // Determine initial question ID based on route state or prop
  const getInitialQuestionId = () => {
    if (roadmapQuestion) return roadmapQuestion.key || roadmapQuestion._key;
    if (specificProblemId) return specificProblemId;
    if (initialQuestionId) return initialQuestionId;
    return sampleQuestions.length > 0 ? sampleQuestions[0].id : null;
  };
  
  const [selectedQuestionId, setSelectedQuestionId] = useState(getInitialQuestionId());
  const [language, setLanguage] = useState('python');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [userTriedToExit, setUserTriedToExit] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const [hasWindowFocus, setHasWindowFocus] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isAttemptingReturn, setIsAttemptingReturn] = useState(false);
  const [periodicCheckCount, setPeriodicCheckCount] = useState(0);
  
  // Session management
  const {
    currentSession,
    isActive: isSessionActive,
    isPaused: isSessionPaused,
    needsRecovery,
    recoveryData,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    trackCodeChange,
    trackTestRun,
    trackHintUsed,
    trackSolutionSubmitted,
    recoverSession,
    dismissRecovery,
    sessionProgress,
    liveMetrics,
    isStarting: isStartingSession,
    isResuming: isResumingSession
  } = useSession();
  
  // Refs for cleanup and timing
  const retryTimeoutRef = useRef(null);
  const enforcementIntervalRef = useRef(null);
  const lastUserActionRef = useRef(Date.now());
  const lastAttemptRef = useRef(0);
  const sessionStartedRef = useRef(false);
  const fullscreenCheckTimeoutRef = useRef(null);

  // Convert roadmap question to sampleQuestion format for compatibility
  const convertRoadmapQuestion = (roadmapQ) => {
    if (!roadmapQ) return null;
    
    // Parse topics if it's a JSON string
    let parsedTopics = [];
    if (roadmapQ.a2z_topics) {
      try {
        const topicsArray = JSON.parse(roadmapQ.a2z_topics);
        parsedTopics = topicsArray.map(t => t.label || t.value || t);
      } catch (e) {
        parsedTopics = roadmapQ.topics || [];
      }
    } else {
      parsedTopics = roadmapQ.topics || [];
    }
    
    return {
      id: roadmapQ.key || roadmapQ._key || roadmapQ.question_id,
      title: roadmapQ.leetcode_title || roadmapQ.original_title || 'Coding Challenge',
      difficulty: roadmapQ.leetcode_difficulty || roadmapQ.difficulty || 'medium',
      description: roadmapQ.problem_statement_html || roadmapQ.problem_statement_text || roadmapQ.problem_statement || 'Problem description not available.',
      examples: roadmapQ.examples || [],
      constraints: roadmapQ.constraints || [],
      hints: roadmapQ.hints || [],
      companies: roadmapQ.company_tags || roadmapQ.companies || [],
      topics: parsedTopics,
      tags: parsedTopics, // Also map to tags for compatibility
      category: roadmapQ.a2z_step || roadmapQ.category || 'General',
      step_number: roadmapQ.step_number,
      approach: roadmapQ.approach,
      time_complexity: roadmapQ.time_complexity,
      space_complexity: roadmapQ.space_complexity,
      solution: roadmapQ.solution,
      // Additional roadmap-specific fields
      leetcode_question_id: roadmapQ.leetcode_question_id,
      leetcode_title_slug: roadmapQ.leetcode_title_slug,
      lc_link: roadmapQ.lc_link,
      a2z_step: roadmapQ.a2z_step,
      a2z_sub_step: roadmapQ.a2z_sub_step,
      is_paid_only: roadmapQ.is_paid_only,
      similar_questions: roadmapQ.similar_questions || [],
      code_templates: roadmapQ.code_templates || {},
      default_code: roadmapQ.default_code || '',
      sample_test_cases: roadmapQ.sample_test_cases || [],
      // Add any other fields that might be needed
      ...roadmapQ
    };
  };

  const selectedQuestion = roadmapQuestion 
    ? convertRoadmapQuestion(roadmapQuestion)
    : sampleQuestions.find(q => q.id === selectedQuestionId);

  // Helper to check if fullscreen is enabled for the session
  const isFullscreenEnabled = useCallback(() => {
    // Show fullscreen exit modal for any active session, not just explicitly configured ones
    return (
      sessionConfig?.fullscreenActivated || 
      currentSession?.config?.enableFullscreen || 
      (currentSession && isSessionActive) // Show for any active session
    );
  }, [sessionConfig?.fullscreenActivated, currentSession?.config?.enableFullscreen, currentSession, isSessionActive]);

  // Initialize session when component mounts or when session config changes
  useEffect(() => {
    const initializeSession = async () => {
      if (!selectedQuestion || sessionStartedRef.current) return;
      
      try {
        const sessionType = roadmapQuestion ? 
          SESSION_TYPES.ROADMAP_CHALLENGE : 
          challengeType === 'daily' ? 
            SESSION_TYPES.DAILY_CHALLENGE : 
            SESSION_TYPES.PRACTICE;

        const newSessionConfig = {
          type: sessionType,
          questionId: selectedQuestion.id,
          questionTitle: selectedQuestion.title,
          roadmapId: roadmapId,
          difficulty: selectedQuestion.difficulty,
          language: language,
          enableBehaviorTracking: true,
          enableFullscreen: sessionConfig?.fullscreenActivated || false,
          timeCommitment: sessionConfig?.timeCommitment || '30min',
          userAgreements: sessionConfig?.userAgreements || {},
        };

        const sessionId = await startSession(newSessionConfig);
        sessionStartedRef.current = true;
        console.log('📊 Session Started - ID:', sessionId);
        console.log('📊 Session Config:', newSessionConfig);
      } catch (error) {
        console.error('Failed to initialize coding session:', error);
      }
    };

    // Only start session if we don't have one and don't need recovery
    if (!currentSession && !needsRecovery) {
      initializeSession();
    }
  }, [selectedQuestion, roadmapQuestion, challengeType, roadmapId, language, sessionConfig, currentSession, needsRecovery, startSession]);

  // Handle session recovery on mount
  useEffect(() => {
    if (needsRecovery && recoveryData) {
      // Show recovery modal - it will handle the UI
      console.log('Session recovery needed:', recoveryData);
      console.log('Current Session ID:', currentSession?.id || 'No current session');
    }
  }, [needsRecovery, recoveryData, currentSession?.id]);

  const handleQuestionChange = (questionId) => {
    setSelectedQuestionId(questionId);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    // Track language change in session
    if (currentSession) {
      try {
        trackEvent('language_changed', { 
          from: language, 
          to: newLanguage 
        });
      } catch (error) {
        console.warn('Failed to track language change event:', error);
      }
    }
  };

  // Check if currently in fullscreen using screenfull (utility function)
  const getCurrentFullscreenState = useCallback(() => {
    return screenfull.isEnabled && screenfull.isFullscreen;
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
    if (fullscreenCheckTimeoutRef.current) {
      clearTimeout(fullscreenCheckTimeoutRef.current);
      fullscreenCheckTimeoutRef.current = null;
    }
  }, []);

  // Robust auto-return to fullscreen with intelligent retry logic
  const attemptFullscreenReturn = useCallback(async () => {
    if (!isFullscreenEnabled() || userTriedToExit || isPermissionDenied || isAttemptingReturn) {
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
  }, [isFullscreenEnabled, userTriedToExit, isPermissionDenied, isAttemptingReturn, isUserPresent, getCurrentFullscreenState, retryCount]);

  // Standard fullscreen entry (for manual calls)
  const enterFullscreen = useCallback(async () => {
    clearRetryTimers();
    setRetryCount(0);
    setIsPermissionDenied(false);
    setIsAttemptingReturn(false);
    lastUserActionRef.current = Date.now();
    
    try {
      if (screenfull.isEnabled) {
        await screenfull.request();
        setUserTriedToExit(false);
        return true;
      } else {
        console.warn('Fullscreen not supported by browser');
        return false;
      }
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
      if (error.name === 'NotAllowedError') {
        setIsPermissionDenied(true);
      }
      return false;
    }
  }, [clearRetryTimers]);

  const exitFullscreen = useCallback(async () => {
    clearRetryTimers();
    lastUserActionRef.current = Date.now();
    
    try {
      if (screenfull.isEnabled && screenfull.isFullscreen) {
        await screenfull.exit();
        return true;
      } else {
        console.warn('Not in fullscreen mode or not supported');
        return false;
      }
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error);
      return false;
    }
  }, [clearRetryTimers]);

  // Start fullscreen enforcement (runs periodically to check if we need to return)
  const startFullscreenEnforcement = useCallback(() => {
    if (!isFullscreenEnabled() || enforcementIntervalRef.current || isPermissionDenied) {
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
  }, [isFullscreenEnabled, userTriedToExit, isPermissionDenied, isAttemptingReturn, isUserPresent, getCurrentFullscreenState, attemptFullscreenReturn]);

  // Stop fullscreen enforcement
  const stopFullscreenEnforcement = useCallback(() => {
    clearRetryTimers();
    setRetryCount(0);
    setIsPermissionDenied(false);
    setIsAttemptingReturn(false);
  }, [clearRetryTimers]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.toggle();
      } else {
        console.warn('Fullscreen not supported by browser');
      }
    } catch (error) {
      console.warn('Failed to toggle fullscreen:', error);
    }
  }, []);

  // Simple fullscreen state checker using screenfull
  const checkFullscreenState = useCallback(() => {
    return screenfull.isEnabled && screenfull.isFullscreen;
  }, []);

  // Screenfull change handler - much simpler and more reliable
  const handleScreenfullChange = useCallback(() => {
    const isCurrentlyFullscreen = screenfull.isEnabled && screenfull.isFullscreen;
    
    // Check if this is an unexpected exit (user pressed Esc/F11, not intentional)
    const wasFullscreen = isFullscreen;
    const isUnexpectedExit = wasFullscreen && !isCurrentlyFullscreen && !userTriedToExit;
    const hasActiveSession = currentSession && isSessionActive;

    if (process.env.NODE_ENV === 'development') {
      console.log('🖥️ Screenfull change detected:', {
        wasFullscreen,
        isCurrentlyFullscreen,
        isUnexpectedExit,
        hasActiveSession,
        userTriedToExit,
        screenfullEnabled: screenfull.isEnabled,
        currentSession: currentSession?.id || 'None',
        isSessionActive,
        sessionStartedRef: sessionStartedRef.current
      });
    }

    // Update the fullscreen state
    setIsFullscreen(isCurrentlyFullscreen);

    // MODIFIED: Show modal for unexpected exits even without active session if user was in fullscreen
    // This handles cases where session might not be properly initialized yet
    if (isUnexpectedExit) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 Showing fullscreen exit modal - unexpected exit detected');
        if (!hasActiveSession) {
          console.log('⚠️ No active session but showing modal anyway for unexpected fullscreen exit');
        }
      }
      setShowExitModal(true);
      // Start enforcement to try to get back to fullscreen if configured
      if (isFullscreenEnabled()) {
        startFullscreenEnforcement();
      }
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
  }, [isFullscreen, userTriedToExit, currentSession, isSessionActive, isFullscreenEnabled, startFullscreenEnforcement, clearRetryTimers, sessionConfig?.fullscreenActivated]);

  // Handle fullscreen change events using screenfull - much cleaner!
  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', handleScreenfullChange);
      screenfull.on('error', (event) => {
        console.error('Screenfull error:', event);
        if (event.type === 'NotAllowedError') {
          setIsPermissionDenied(true);
        }
      });

      return () => {
        screenfull.off('change', handleScreenfullChange);
        screenfull.off('error');
      };
    } else {
      console.warn('Fullscreen API not supported by this browser');
    }
  }, [handleScreenfullChange]);

  // Periodic fullscreen check every 3 seconds as a safety net
  useEffect(() => {
    if (!screenfull.isEnabled) return;

    const intervalId = setInterval(() => {
      setPeriodicCheckCount(prev => prev + 1);
      
      const actualFullscreenState = screenfull.isFullscreen;
      const currentReactState = isFullscreen;

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Periodic 3s check #' + (periodicCheckCount + 1) + ':', {
          actualFullscreenState,
          currentReactState,
          mismatch: actualFullscreenState !== currentReactState,
          showExitModal
        });
      }

      // Only trigger handler if there's a mismatch between actual state and React state
      if (actualFullscreenState !== currentReactState) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Periodic check detected fullscreen state mismatch - triggering handler');
        }
        handleScreenfullChange();
      }
    }, 3000); // Check every 3 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [isFullscreen, handleScreenfullChange, showExitModal, periodicCheckCount]);

  // Auto-enter fullscreen if session config requires it
  useEffect(() => {
    let timeoutId;
    
    if (isFullscreenEnabled() && screenfull.isEnabled) {
      const currentlyFullscreen = screenfull.isFullscreen;
      
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
  }, [isFullscreenEnabled, enterFullscreen]);

  // Track tab visibility (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      // When user returns to tab, attempt fullscreen if needed (but less aggressively)
      if (isVisible && isFullscreenEnabled() && !userTriedToExit && !isPermissionDenied) {
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
  }, [isFullscreenEnabled, userTriedToExit, isPermissionDenied, isAttemptingReturn, getCurrentFullscreenState, isUserPresent, attemptFullscreenReturn]);

  // Track window focus (for app switching detection)
  useEffect(() => {
    const handleFocus = () => {
      setHasWindowFocus(true);
      lastUserActionRef.current = Date.now();
      
      // When user returns to window, attempt fullscreen if needed (but less aggressively)
      if (isFullscreenEnabled() && !userTriedToExit && !isPermissionDenied) {
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
  }, [isFullscreenEnabled, userTriedToExit, isPermissionDenied, isAttemptingReturn, getCurrentFullscreenState, isUserPresent, attemptFullscreenReturn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFullscreenEnforcement();
      clearRetryTimers(); // This now includes fullscreen check timeout cleanup
      
      // End session if active (but only in production to avoid dev mode double cleanup)
      if (currentSession && process.env.NODE_ENV === 'production') {
        endSession('component_unmount').catch(error => {
          console.error('Failed to end session on unmount:', error);
        });
      }
    };
  }, [stopFullscreenEnforcement, clearRetryTimers, currentSession, endSession]);

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

  // Session recovery handlers
  const handleRecoverSession = useCallback(async () => {
    try {
      const success = await recoverSession();
      if (success) {
        console.log('Session recovered successfully');
      }
    } catch (error) {
      console.error('Failed to recover session:', error);
    }
  }, [recoverSession]);

  const handleDismissRecovery = useCallback(async () => {
    try {
      dismissRecovery();
      
      // Start a fresh session
      if (selectedQuestion && !currentSession) {
        const sessionType = roadmapQuestion ? 
          SESSION_TYPES.ROADMAP_CHALLENGE : 
          challengeType === 'daily' ? 
            SESSION_TYPES.DAILY_CHALLENGE : 
            SESSION_TYPES.PRACTICE;

        const newSessionConfig = {
          type: sessionType,
          questionId: selectedQuestion.id,
          questionTitle: selectedQuestion.title,
          roadmapId: roadmapId,
          difficulty: selectedQuestion.difficulty,
          language: language,
          enableBehaviorTracking: true,
          enableFullscreen: sessionConfig?.fullscreenActivated || false,
          timeCommitment: sessionConfig?.timeCommitment || '30min',
          userAgreements: sessionConfig?.userAgreements || {},
        };

        await startSession(newSessionConfig);
        sessionStartedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to dismiss recovery and start new session:', error);
    }
  }, [dismissRecovery, selectedQuestion, currentSession, roadmapQuestion, challengeType, roadmapId, language, sessionConfig, startSession]);

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
    if (process.env.NODE_ENV === 'development') {
      console.log('🛑 User chose to end session from fullscreen exit modal');
    }
    setShowExitModal(false);
    setUserTriedToExit(true);
    stopFullscreenEnforcement();
    
    // Ensure we exit fullscreen first
    if (getCurrentFullscreenState()) {
      await exitFullscreen();
    }
    
    // End the coding session
    try {
      await endSession('user_exit_fullscreen', {
        reason: 'User chose to end session from fullscreen exit modal',
        timeElapsed: Date.now() - sessionStartTime
      });
      sessionStartedRef.current = false;
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Session ended successfully');
      }
    } catch (error) {
      console.error('Failed to end session properly:', error);
    }
    
    // Navigate back to appropriate page
    if (roadmapId) {
      navigate(`/roadmap/${roadmapId}`);
    } else {
      navigate('/dashboard');
    }
  }, [endSession, exitFullscreen, navigate, getCurrentFullscreenState, stopFullscreenEnforcement, roadmapId, sessionStartTime]);

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
    challengeType: roadmapQuestion ? 'Roadmap Challenge' : (challengeType || 'Practice')
  }), [selectedQuestion?.title, showExitModal, getFormattedElapsedTime, language, challengeType, roadmapQuestion]);


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
          
            {/* Session Counter */}
            {currentSession && (
              <SessionNavbarCounter
                session={currentSession}
                isActive={isSessionActive}
                isPaused={isSessionPaused}
                onPause={() => pauseSession('user_pause')}
                onResume={resumeSession}
              />
            )}

            {/* Development test buttons */}
            {process.env.NODE_ENV === 'development' && !currentSession && (
              <button
                onClick={async () => {
                  if (selectedQuestion) {
                    const newSessionConfig = {
                      type: SESSION_TYPES.PRACTICE,
                      questionId: selectedQuestion.id,
                      questionTitle: selectedQuestion.title,
                      difficulty: selectedQuestion.difficulty,
                      language: language,
                      enableBehaviorTracking: true,
                      enableFullscreen: false,
                      timeCommitment: '30min',
                      userAgreements: {},
                    };
                    try {
                      await startSession(newSessionConfig);
                      sessionStartedRef.current = true;
                      console.log('🔧 Manual session started');
                    } catch (error) {
                      console.error('Failed to start manual session:', error);
                    }
                  }
                }}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
                title="Manually Start Session"
              >
                Start Session
              </button>
            )}
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
            onQuestionChange={roadmapQuestion ? null : handleQuestionChange} // Disable question switching for roadmap challenges
            availableQuestions={roadmapQuestion ? [] : sampleQuestions} // No question list for roadmap challenges
            isRoadmapChallenge={!!roadmapQuestion}
            roadmapId={roadmapId}
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

      {/* Session Recovery Modal */}
      <SessionRecoveryModal
        isOpen={needsRecovery && !!recoveryData}
        recoveryData={recoveryData}
        onRecover={handleRecoverSession}
        onDismiss={handleDismissRecovery}
        isRecovering={isResumingSession}
      />
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/90 text-white text-xs p-3 rounded-lg z-50 max-w-md border border-zinc-600">
          <div className="font-bold text-blue-300 mb-2">🔧 Development Debug Panel</div>
          <div>📊 Session ID: {currentSession?.id || 'None'}</div>
          <div>⚡ Status: Active={String(isSessionActive)} | Paused={String(isSessionPaused)}</div>
          <div>🔧 Session: Started={String(sessionStartedRef.current)} | Type={currentSession?.type || 'None'}</div>
          <div>🔄 Recovery: needsRecovery={String(needsRecovery)} | hasData={String(!!recoveryData)}</div>
          <div>🖥️ Fullscreen: React={String(isFullscreen)} | Actual={String(screenfull.isEnabled && screenfull.isFullscreen)} | Modal={String(showExitModal)}</div>
          <div>📚 Screenfull: Enabled={String(screenfull.isEnabled)}</div>
          <div>🎯 Question: {selectedQuestion?.title || 'None'}</div>
          <div className="text-green-300 mt-1">✅ Screenfull.js + 3s Safety Check (#{periodicCheckCount})</div>
        </div>
      )}

    </div>
  );
};

export default CodingInterface;
