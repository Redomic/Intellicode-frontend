# Session Management System

A comprehensive session management system for tracking coding sessions with analytics, persistence, and recovery capabilities.

## Overview

The session management system consists of several key components:

- **SessionOrchestrator**: Core service that manages session lifecycle
- **Session Redux Store**: Global state management for session data
- **useSession Hook**: React hook for easy session integration
- **UI Components**: Modal and status components for session interaction

## Key Features

### 🎯 Session Lifecycle Management
- Automatic session initialization when challenges start
- Session persistence across page refreshes
- Graceful session termination and cleanup

### 📊 Real-time Analytics
- Live keystroke and behavior tracking
- Code change monitoring
- Test run and hint usage tracking
- Performance metrics collection

### 🔄 Session Recovery
- Automatic detection of interrupted sessions
- Smart recovery modal with session preview
- Option to continue or start fresh

### 💾 Data Persistence
- localStorage-based session persistence
- Session history management
- Analytics data preservation

### 📈 Session Insights
- Completion rate tracking
- Streak calculation
- Performance trend analysis
- Detailed session analytics

## Usage

### Basic Session Management

```jsx
import useSession from '../hooks/useSession';

function CodingComponent() {
  const {
    startPracticeSession,
    trackCodeChange,
    trackTestRun,
    endSession,
    currentSession,
    sessionProgress
  } = useSession();

  const handleStartCoding = async () => {
    await startPracticeSession({
      questionId: 'two-sum',
      questionTitle: 'Two Sum',
      difficulty: 'easy',
      language: 'python'
    });
  };

  const handleCodeChange = (newCode) => {
    trackCodeChange(newCode, 'python');
  };

  const handleRunTest = (results) => {
    trackTestRun(results);
  };

  return (
    <div>
      {currentSession ? (
        <div>Session active: {currentSession.questionTitle}</div>
      ) : (
        <button onClick={handleStartCoding}>Start Coding</button>
      )}
    </div>
  );
}
```

### Session Recovery

The system automatically detects interrupted sessions and shows a recovery modal:

```jsx
import SessionRecoveryModal from '../components/session/SessionRecoveryModal';

function App() {
  const { needsRecovery, recoveryData, recoverSession, dismissRecovery } = useSession();

  return (
    <div>
      <SessionRecoveryModal
        isOpen={needsRecovery}
        recoveryData={recoveryData}
        onRecover={recoverSession}
        onDismiss={dismissRecovery}
      />
    </div>
  );
}
```

### Session Analytics

Display comprehensive session analytics:

```jsx
import SessionAnalytics from '../components/session/SessionAnalytics';

function AnalyticsPage() {
  const { sessionHistory, sessionInsights, sessionAnalytics } = useSession();

  return (
    <SessionAnalytics
      sessionHistory={sessionHistory}
      sessionInsights={sessionInsights}
      currentSession={sessionAnalytics}
    />
  );
}
```

### Live Session Status

Show real-time session information:

```jsx
import SessionStatusIndicator from '../components/session/SessionStatusIndicator';

function CodingInterface() {
  const { 
    currentSession, 
    isActive, 
    sessionProgress, 
    liveMetrics 
  } = useSession();

  return (
    <div>
      {currentSession && (
        <SessionStatusIndicator
          session={currentSession}
          isActive={isActive}
          sessionProgress={sessionProgress}
          liveMetrics={liveMetrics}
        />
      )}
    </div>
  );
}
```

## Session Types

The system supports different session types:

- **PRACTICE**: General coding practice
- **DAILY_CHALLENGE**: Daily challenge sessions
- **ROADMAP_CHALLENGE**: Roadmap-based challenges
- **ASSESSMENT**: Assessment or evaluation sessions

## Session Configuration

Sessions can be configured with various options:

```jsx
const sessionConfig = {
  type: SESSION_TYPES.ROADMAP_CHALLENGE,
  questionId: 'binary-search',
  questionTitle: 'Binary Search',
  difficulty: 'easy',
  language: 'python',
  enableBehaviorTracking: true,
  enableFullscreen: true,
  timeCommitment: '30min',
  userAgreements: {
    noCheating: true,
    privacyConsent: true
  }
};

await startSession(sessionConfig);
```

## Events Tracking

Track various coding events:

```jsx
// Code changes
trackCodeChange(code, language);

// Test runs
trackTestRun({ passed: 5, failed: 2, total: 7 });

// Hint usage
trackHintUsed(hintIndex, hintText);

// Solution submission
trackSolutionSubmitted(isCorrect, attempts);
```

## Session States

Sessions progress through these states:
- `IDLE`: No active session
- `PREPARING`: Session initialization
- `ACTIVE`: Session in progress
- `PAUSED`: Session temporarily paused
- `COMPLETED`: Session finished successfully
- `ABANDONED`: Session ended without completion
- `ERROR`: Session encountered an error

## Performance Considerations

- Sessions auto-save every 30 seconds by default
- Live metrics update every 10 seconds
- Session history is limited to 50 most recent sessions
- Code snapshots are limited to 20 most recent versions

## Integration with Existing Systems

The session management system integrates seamlessly with:
- **Behavior Tracking**: Automatic keystroke and activity monitoring
- **User Analytics**: Session data contributes to user insights
- **Progress Tracking**: Session completion affects roadmap progress
- **Gamification**: Session streaks and achievements

## Debugging

In development mode, session data is available on the window object:

```javascript
// Access current session data
console.log(window.sessionOrchestrator.getCurrentSession());

// View session history
console.log(window.sessionOrchestrator.getSessionHistory());

// Check session analytics
console.log(window.sessionOrchestrator.getSessionAnalytics());
```

## Best Practices

1. **Always end sessions gracefully** when users navigate away
2. **Use appropriate session types** for different coding contexts
3. **Track meaningful events** to build useful analytics
4. **Handle session recovery** to provide smooth user experience
5. **Monitor session performance** to optimize the experience
