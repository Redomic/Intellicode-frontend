/**
 * Session Constants
 * Centralized constants for session management - simplified to only ACTIVE and ABANDONED states
 */

export const SESSION_STATES = {
  ACTIVE: 'active',
  ABANDONED: 'abandoned'
};

export const SESSION_TYPES = {
  DAILY_CHALLENGE: 'daily_challenge',
  ROADMAP_CHALLENGE: 'roadmap_challenge', 
  PRACTICE: 'practice',
  ASSESSMENT: 'assessment'
};

// Helper to check session state
export const isSessionActive = (session) => session?.state === SESSION_STATES.ACTIVE;
export const isSessionAbandoned = (session) => session?.state === SESSION_STATES.ABANDONED;
export const hasActiveSession = (session) => session && isSessionActive(session);