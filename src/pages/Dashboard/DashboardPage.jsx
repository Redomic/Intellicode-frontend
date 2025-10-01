import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectSkillLevel } from '../../store/userSlice';
import { SKILL_LEVEL_CONFIG } from '../../constants/skillLevels';
import Navigation from '../../components/Navigation';
import ProfileHeader from '../../components/dashboard/ProfileHeader';
import StreakCounter from '../../components/dashboard/StreakCounter';
import ContributionHeatmap from '../../components/dashboard/ContributionHeatmap';
import RoadmapsSection from '../../components/dashboard/RoadmapsSection';
import ChallengeStartModal from '../../components/coding/ChallengeStartModal';
import RoadmapChallengeModal from '../../components/roadmap/RoadmapChallengeModal';
import SessionRecoveryModal from '../../components/session/SessionRecoveryModal';
import RoadmapTracker from '../../utils/roadmapTracker';
import { useRoadmapQuestions, useCompletedQuestions } from '../../hooks/useAPI';
import useSession from '../../hooks/useSession';
import SessionAnalytics from '../../components/session/SessionAnalytics';
import sessionAPI from '../../services/sessionAPI';

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const skillLevel = useSelector(selectSkillLevel);
  const levelConfig = skillLevel ? SKILL_LEVEL_CONFIG[skillLevel] : null;
  const navigate = useNavigate();
  
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoverySession, setRecoverySession] = useState(null);
  const [nextLevelInfo, setNextLevelInfo] = useState(null);
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  const { data: questionsData } = useRoadmapQuestions(activeRoadmap?.courseId);
  const { data: completedStepsData } = useCompletedQuestions(activeRoadmap?.courseId);
  
  // Session management
  const { 
    sessionHistory, 
    sessionInsights, 
    sessionAnalytics,
    loadHistory
  } = useSession();
  
  // Load active roadmap on component mount and when refreshed
  const refreshActiveRoadmap = () => {
    const roadmap = RoadmapTracker.getAnyActivatedRoadmap();
    setActiveRoadmap(roadmap);
  };

  useEffect(() => {
    refreshActiveRoadmap();
    // Load session history for analytics
    loadHistory(20);
  }, [loadHistory]);

  // Calculate next level from backend data (no localStorage)
  useEffect(() => {
    if (activeRoadmap && completedStepsData && questionsData && questionsData.length > 0) {
      console.log('🔄 Calculating next level from backend data:', completedStepsData);
      
      const nextLevel = RoadmapTracker.getNextLevel(completedStepsData, questionsData);
      setNextLevelInfo(nextLevel ? {
        question: nextLevel,
        courseName: activeRoadmap.courseName,
        courseId: activeRoadmap.courseId
      } : null);
    } else {
      setNextLevelInfo(null);
    }
  }, [activeRoadmap, completedStepsData, questionsData]);

  const handleStartChallenge = async () => {
    console.log('🔍 Checking for active session before starting challenge...');
    
    // Check if user has any active session
    try {
      const activeSession = await sessionAPI.getActiveSession();
      
      if (activeSession && activeSession.state === 'active') {
        console.log('✅ Active session found:', activeSession);
        console.log('🔄 Showing recovery modal for session:', activeSession.sessionId);
        console.log('📋 Recovery session data:', {
          questionTitle: activeSession.questionTitle,
          questionId: activeSession.questionId,
          startTime: activeSession.startTime,
          state: activeSession.state
        });
        
        // Show recovery modal
        setRecoverySession(activeSession);
        setShowRecoveryModal(true);
        console.log('✅ Modal state set: showRecoveryModal = true');
        return;
      }
    } catch (error) {
      console.log('ℹ️  No active session found, proceeding with new challenge');
    }
    
    // No active session, show the appropriate challenge modal
    if (nextLevelInfo) {
      setShowRoadmapModal(true);
    } else {
      setShowChallengeModal(true);
    }
  };
  
  const handleRecoverSession = () => {
    console.log('🔄 Recovering session from dashboard:', recoverySession.sessionId);
    
    // Close recovery modal
    setShowRecoveryModal(false);
    
    // Navigate to the appropriate page based on session type
    const sessionType = recoverySession.sessionType;
    const questionId = recoverySession.questionId;
    const roadmapId = recoverySession.roadmapId;
    
    if (sessionType === 'roadmap_challenge' && roadmapId && questionId) {
      console.log('🎯 Navigating to roadmap challenge:', roadmapId, questionId);
      navigate(`/challenge/${roadmapId}/${questionId}`, {
        state: {
          resumeSession: true,
          sessionId: recoverySession.sessionId
        }
      });
    } else {
      console.log('🎯 Navigating to practice challenge:', questionId);
      navigate('/practice', {
        state: {
          resumeSession: true,
          sessionId: recoverySession.sessionId,
          specificProblemId: questionId
        }
      });
    }
  };
  
  const handleDismissRecovery = async () => {
    console.log('❌ Dismissing recovery and ending session:', recoverySession.sessionId);
    
    try {
      // End the old session
      await sessionAPI.endSession(recoverySession.sessionId, 'user_dismissed');
      console.log('✅ Old session ended successfully');
    } catch (error) {
      console.error('❌ Failed to end old session:', error);
    }
    
    // Close recovery modal
    setShowRecoveryModal(false);
    setRecoverySession(null);
    
    // Show the appropriate challenge modal
    if (nextLevelInfo) {
      setShowRoadmapModal(true);
    } else {
      setShowChallengeModal(true);
    }
  };

  const handleDailyChallengeStart = (sessionConfig) => {
    // Navigate to practice route with session config for daily challenge
    navigate('/practice', { 
      state: { 
        challengeType: 'daily',
        sessionConfig,
        specificProblemId: 1 // Two Sum problem for now
      } 
    });
  };

  const handleRoadmapChallengeStart = (challengeData) => {
    // Navigate to new challenge route format
    const questionKey = challengeData.question.key || challengeData.question._key;
    const courseId = nextLevelInfo.courseId;
    
    // Navigate directly to the challenge page
    navigate(`/challenge/${courseId}/${questionKey}`);
  };

    return (
    <div className="min-h-screen bg-zinc-900">
      {/* Navigation */}
      <Navigation />

      {/* GitHub-Style Profile Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader 
            user={user} 
            onStartChallenge={handleStartChallenge}
            nextLevelInfo={nextLevelInfo}
          />
        </div>

        {/* Main Content Row - Coding Activity (70%) + Daily Streak (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8">
          {/* Coding Activity - 70% */}
          <div className="lg:col-span-7">
            <ContributionHeatmap user={user} />
          </div>
          
          {/* Daily Streak - 30% */}
          <div className="lg:col-span-3">
            <StreakCounter streak={23} />
          </div>
        </div>

        {/* Session Analytics Section */}
        {sessionHistory && sessionHistory.length > 0 && (
          <div className="mb-8">
            <SessionAnalytics
              sessionHistory={sessionHistory}
              sessionInsights={sessionInsights}
              sessionAnalytics={sessionAnalytics}
              className="w-full"
            />
          </div>
        )}

        {/* Roadmaps Section - Full Width Horizontal Slider */}
        <div className="w-full">
          <RoadmapsSection onRoadmapChange={refreshActiveRoadmap} />
        </div>
      </div>

      {/* Daily Challenge Start Modal */}
      <ChallengeStartModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onStartChallenge={handleDailyChallengeStart}
        challengeTitle="Daily Challenge"
      />

      {/* Roadmap Challenge Start Modal */}
      <RoadmapChallengeModal
        isOpen={showRoadmapModal}
        onClose={() => setShowRoadmapModal(false)}
        onStartChallenge={handleRoadmapChallengeStart}
        question={nextLevelInfo?.question}
        isCompleted={nextLevelInfo && completedStepsData ? completedStepsData.includes(nextLevelInfo.question.step_number) : false}
      />

      {/* Session Recovery Modal */}
      <SessionRecoveryModal
        isOpen={showRecoveryModal}
        onRecover={handleRecoverSession}
        onDismiss={handleDismissRecovery}
        recoveryData={recoverySession ? {
          questionTitle: recoverySession.questionTitle || recoverySession.question_title,
          questionId: recoverySession.questionId || recoverySession.question_id,
          sessionType: recoverySession.sessionType || recoverySession.session_type,
          roadmapId: recoverySession.roadmapId || recoverySession.roadmap_id,
          timePaused: recoverySession.startTime 
            ? Math.floor((Date.now() - new Date(recoverySession.startTime).getTime()) / 1000)
            : 0,
          lastCode: recoverySession.currentCode ? {
            code: recoverySession.currentCode,
            language: recoverySession.programmingLanguage || 'python'
          } : null,
          analytics: {
            codeChanges: 0,
            testsRun: 0
          }
        } : null}
      />

    </div>
  );
};

export default DashboardPage;
