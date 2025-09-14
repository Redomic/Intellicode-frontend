import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectSkillLevel } from '../../store/userSlice';
import { SKILL_LEVEL_CONFIG } from '../../constants/skillLevels';
import Navigation from '../../components/Navigation';
import ProfileHeader from '../../components/dashboard/ProfileHeader';
import StreakCounter from '../../components/dashboard/StreakCounter';
import ContributionHeatmap from '../../components/dashboard/ContributionHeatmap';
import ChallengeStartModal from '../../components/coding/ChallengeStartModal';

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const skillLevel = useSelector(selectSkillLevel);
  const levelConfig = skillLevel ? SKILL_LEVEL_CONFIG[skillLevel] : null;
  const navigate = useNavigate();
  
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const handleStartDailyChallenge = () => {
    setShowChallengeModal(true);
  };

  const handleChallengeStart = (sessionConfig) => {
    // Navigate to practice route with session config
    navigate('/practice', { 
      state: { 
        challengeType: 'daily',
        sessionConfig,
        specificProblemId: 1 // Two Sum problem for now
      } 
    });
  };

    return (
    <div className="min-h-screen bg-zinc-900">
      {/* Navigation */}
      <Navigation />

      {/* GitHub-Style Profile Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={user} onStartChallenge={handleStartDailyChallenge} />
        </div>

        {/* Main Content Row - Coding Activity (70%) + Daily Streak (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Coding Activity - 70% */}
          <div className="lg:col-span-7">
            <ContributionHeatmap user={user} />
          </div>
          
          {/* Daily Streak - 30% */}
          <div className="lg:col-span-3">
            <StreakCounter streak={23} />
          </div>
        </div>
      </div>

      {/* Challenge Start Modal */}
      <ChallengeStartModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onStartChallenge={handleChallengeStart}
        challengeTitle="Daily Challenge"
      />
    </div>
  );
};

export default DashboardPage;
