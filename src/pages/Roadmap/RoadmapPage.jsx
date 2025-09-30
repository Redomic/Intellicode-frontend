import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { FireIcon as FireSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Navigation from '../../components/Navigation';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useRoadmapQuestions, useCompletedQuestions } from '../../hooks/useAPI';
import LevelNode from '../../components/roadmap/LevelNode';
import RoadmapTracker from '../../utils/roadmapTracker';
import RoadmapChallengeModal from '../../components/roadmap/RoadmapChallengeModal';
import SessionRecoveryModal from '../../components/session/SessionRecoveryModal';
import sessionAPI from '../../services/sessionAPI';
import useSession from '../../hooks/useSession';

const RoadmapPage = () => {
  const { course } = useParams();
  const navigate = useNavigate();
  const { data: questionsData, loading, error } = useRoadmapQuestions(course);
  const { data: completedStepsData, loading: loadingCompleted } = useCompletedQuestions(course);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [unlockedLevels, setUnlockedLevels] = useState(new Set([1])); // First level is always unlocked
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [recoveryData, setRecoveryData] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  
  const { endSession } = useSession();

  const questions = questionsData || [];
  
  // Sync progress from backend when completed steps are loaded
  useEffect(() => {
    if (completedStepsData && questions.length > 0 && course) {
      console.log('🔄 Syncing roadmap progress from backend:', completedStepsData);
      RoadmapTracker.syncProgressFromBackend(course, completedStepsData, questions);
      
      // Update local state
      const completed = RoadmapTracker.getCompletedLevels(course);
      const unlocked = RoadmapTracker.getUnlockedLevels(course);
      
      setCompletedLevels(completed);
      setUnlockedLevels(unlocked);
    }
  }, [completedStepsData, questions, course]);
  
  // Load progress from roadmap tracker and check if roadmap is activated
  useEffect(() => {
    if (questions.length > 0 && course) {
      // Only allow access if roadmap is activated
      if (!RoadmapTracker.isRoadmapActivated(course)) {
        // Redirect to dashboard if roadmap is not activated
        navigate('/dashboard');
        return;
      }

      // Set this as the active roadmap (only works if it's activated)
      const courseName = course === 'strivers-a2z' ? "Striver's A2Z DSA Course" : 
                        course.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      RoadmapTracker.setActiveRoadmap(course, courseName);

      // Load progress from localStorage (will be overridden by backend sync if available)
      const completed = RoadmapTracker.getCompletedLevels(course);
      const unlocked = RoadmapTracker.getUnlockedLevels(course);

      // Ensure at least the first level is unlocked
      if (unlocked.size === 0) {
        unlocked.add(1);
        RoadmapTracker.setUnlockedLevels(course, unlocked);
      }

      setCompletedLevels(completed);
      setUnlockedLevels(unlocked);
    }
  }, [questions, course, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">Failed to load roadmap</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const courseName = course === 'strivers-a2z' ? "Striver's A2Z DSA Course" : 
                   course.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const handleLevelClick = async (question) => {
    if (!unlockedLevels.has(question.step_number)) {
      return;
    }
    
    setSelectedQuestion(question);
    setIsCheckingSession(true);
    
    try {
      console.log('🔍 Checking for active session for question:', question.leetcode_title || question.original_title);
      
      // Check if there's an active session for this specific question
      const activeSession = await sessionAPI.getActiveSessionByQuestion(
        null,
        question.leetcode_title || question.original_title
      );
      
      if (activeSession) {
        console.log('✅ Found active session for this question:', activeSession);
        
        // Prepare recovery data
        const recoveryInfo = {
          sessionId: activeSession.session_id,
          questionTitle: activeSession.question_title,
          timePaused: Math.floor((Date.now() - new Date(activeSession.last_activity).getTime()) / 1000),
          lastCode: null, // Will be fetched if user chooses to recover
          analytics: activeSession.analytics || {}
        };
        
        setRecoveryData(recoveryInfo);
        setShowRecoveryModal(true);
      } else {
        console.log('ℹ️ No active session found, showing challenge modal');
        setShowChallengeModal(true);
      }
    } catch (error) {
      console.error('Error checking for active session:', error);
      // On error, show challenge modal anyway
      setShowChallengeModal(true);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleRecoverSession = async () => {
    if (!selectedQuestion || !recoveryData) return;
    
    try {
      console.log('🔄 Recovering session:', recoveryData.sessionId);
      
      // Navigate directly to the challenge with the existing session
      const questionKey = selectedQuestion.key || selectedQuestion._key;
      navigate(`/challenge/${course}/${questionKey}`, {
        state: {
          resumeSession: true,
          sessionId: recoveryData.sessionId
        }
      });
      
      setShowRecoveryModal(false);
      setRecoveryData(null);
    } catch (error) {
      console.error('Error recovering session:', error);
      setShowRecoveryModal(false);
      setRecoveryData(null);
    }
  };

  const handleDismissRecovery = async () => {
    if (!recoveryData) return;
    
    try {
      console.log('🗑️ Dismissing recovery and ending old session:', recoveryData.sessionId);
      
      // End the old session
      await endSession('user_dismissed');
      
      setShowRecoveryModal(false);
      setRecoveryData(null);
      
      // Show the challenge modal to start fresh
      setShowChallengeModal(true);
    } catch (error) {
      console.error('Error dismissing recovery:', error);
      // Still show the modal even if ending session fails
      setShowRecoveryModal(false);
      setShowChallengeModal(true);
    }
  };

  const handleStartChallenge = (challengeData) => {
    console.log('🚀 Starting challenge with config:', challengeData);
    const questionKey = challengeData.question.key || challengeData.question._key;
    navigate(`/challenge/${course}/${questionKey}`, {
      state: {
        sessionConfig: challengeData
      }
    });
  };


  // Simple vertical path like Duolingo
  const createVerticalPath = () => {
    if (questions.length === 0) return [];
    return questions.slice(0, 20); // Show first 20 levels for demo
  };

  const visibleQuestions = createVerticalPath();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30">
      <Navigation />
      
      {/* Header */}
      <motion.div 
        className="sticky top-16 z-30 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800/50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors group"
              whileHover={{ x: -2 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeftIcon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium">Dashboard</span>
            </motion.button>
            
            {/* Course Title */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{courseName}</h1>
              <p className="text-sm text-zinc-400">{questions.length} challenges</p>
            </div>
            
            {/* Progress Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-orange-400">
                <FireSolid className="w-5 h-5" />
                <span className="font-bold">3</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <StarSolid className="w-5 h-5" />
                <span className="font-bold">1250</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Main Content - Duolingo Style Vertical Path */}
      <div className="relative px-6 py-8 bg-gradient-to-b from-zinc-900/50 to-zinc-800/30 min-h-screen">
        <div className="max-w-md mx-auto">
          
          {/* Vertical Learning Path */}
          <div className="relative">
            {/* Background Path Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-zinc-500/30 z-0" />
            
            {/* Progress Path Line - Green portion */}
            <motion.div 
              className="absolute left-1/2 top-0 transform -translate-x-1/2 w-1 bg-emerald-400 shadow-lg shadow-emerald-400/50 z-[1] rounded-full"
              initial={{ height: 0 }}
              animate={{ 
                height: `${(completedLevels.size / visibleQuestions.length) * 100}%` 
              }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            />
            
            {/* Level Nodes */}
            <div className="relative z-10 space-y-12 py-8">
              {visibleQuestions.map((question, index) => {
                const isCompleted = completedLevels.has(question.step_number);
                const isUnlocked = unlockedLevels.has(question.step_number);
                const isCurrent = !isCompleted && isUnlocked && index === Math.min(...Array.from(unlockedLevels)) - 1;
                
                return (
                  <div key={question.step_number} className="relative">
                    {/* Connection to path */}
                    <div 
                      className={`absolute left-1/2 top-8 transform -translate-x-1/2 w-1 h-4 z-0
                        ${isCompleted ? 'bg-emerald-400' : isUnlocked ? 'bg-sky-400' : 'bg-zinc-500/30'}
                      `}
                    />
                    
                    {/* Level Node */}
                    <div className={`flex justify-center ${index % 3 === 1 ? 'ml-16' : index % 3 === 2 ? 'mr-16' : ''}`}>
                      <LevelNode
                        question={question}
                        isCompleted={isCompleted}
                        isUnlocked={isUnlocked}
                        isCurrent={isCurrent}
                        onClick={() => handleLevelClick(question)}
                        delay={index * 0.1}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Path Indicator */}
            <motion.div 
              className="flex flex-col items-center mt-12 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="w-12 h-12 bg-zinc-700/50 rounded-full flex items-center justify-center mb-4">
                <div className="text-zinc-400 font-bold">...</div>
              </div>
              <p className="text-zinc-400 text-sm text-center">
                More levels unlock as you progress!
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Challenge Start Modal */}
      <RoadmapChallengeModal
        isOpen={showChallengeModal}
        onClose={() => {
          setShowChallengeModal(false);
          setSelectedQuestion(null);
        }}
        onStartChallenge={handleStartChallenge}
        question={selectedQuestion}
        isCompleted={selectedQuestion ? completedLevels.has(selectedQuestion.step_number) : false}
      />

      {/* Session Recovery Modal */}
      <SessionRecoveryModal
        isOpen={showRecoveryModal}
        recoveryData={recoveryData}
        onRecover={handleRecoverSession}
        onDismiss={handleDismissRecovery}
        isRecovering={isCheckingSession}
      />
    </div>
  );
};

export default RoadmapPage;
