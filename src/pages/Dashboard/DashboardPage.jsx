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
import RoadmapTracker from '../../utils/roadmapTracker';
import { useRoadmapQuestions } from '../../hooks/useAPI';
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
  const [nextLevelInfo, setNextLevelInfo] = useState(null);
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  const { data: questionsData } = useRoadmapQuestions(activeRoadmap?.courseId);
  
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

  // Update next level info when questions or active roadmap changes
  useEffect(() => {
    if (activeRoadmap && questionsData && questionsData.length > 0) {
      const nextLevel = RoadmapTracker.getNextLevel(questionsData);
      setNextLevelInfo(nextLevel ? {
        question: nextLevel,
        courseName: activeRoadmap.courseName,
        courseId: activeRoadmap.courseId
      } : null);
    } else {
      setNextLevelInfo(null);
    }
  }, [activeRoadmap, questionsData]);

  const handleStartChallenge = async () => {
    try {
      console.log('🔍 Checking for active session before starting challenge...');
      
      // Check if there's an active session in the backend
      const activeSession = await sessionAPI.getActiveSession();
      
      if (activeSession) {
        console.log('✅ Active session found:', activeSession);
        
        // If there's a roadmap session, we need to find the question key
        if (activeSession.roadmap_id) {
          console.log('🔍 Fetching roadmap questions to find question key...');
          // Fetch the roadmap questions to find the question key
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/roadmaps/${activeSession.roadmap_id}/questions`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.ok) {
              const questions = await response.json();
              // Find the question by title (more reliable than numeric ID)
              const question = questions.find(q => 
                q.leetcode_title === activeSession.question_title || 
                q.original_title === activeSession.question_title
              );
              
              if (question) {
                const questionKey = question.key || question._key;
                console.log('✅ Found question key:', questionKey);
                navigate(`/challenge/${activeSession.roadmap_id}/${questionKey}`);
                return;
              } else {
                console.warn('⚠️ Question not found in roadmap, showing modal');
              }
            }
          } catch (error) {
            console.error('Error fetching roadmap questions:', error);
          }
        } else if (activeSession.question_id) {
          // Daily challenge - use numeric ID
          navigate('/practice', { 
            state: { 
              challengeType: 'daily',
              specificProblemId: activeSession.question_id
            } 
          });
          return;
        }
        
        // Fallback: show modal if we couldn't navigate
        if (nextLevelInfo) {
          setShowRoadmapModal(true);
        } else {
          setShowChallengeModal(true);
        }
      } else {
        console.log('ℹ️ No active session, showing challenge modal');
        // No active session, show the appropriate modal
        if (nextLevelInfo) {
          setShowRoadmapModal(true);
        } else {
          setShowChallengeModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking for active session:', error);
      // On error, show modal anyway
      if (nextLevelInfo) {
        setShowRoadmapModal(true);
      } else {
        setShowChallengeModal(true);
      }
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
        isCompleted={nextLevelInfo ? RoadmapTracker.getCompletedLevels(nextLevelInfo.courseId).has(nextLevelInfo.question.step_number) : false}
      />
    </div>
  );
};

export default DashboardPage;
