import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/userSlice';
import { useGetProfileSummary } from '../../services/api';

/**
 * ProfileHeader - GitHub-style profile header with user info and rating
 */
const ProfileHeader = ({ user, onStartChallenge }) => {
  // Countdown timer state
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
  
  // Check authentication state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Fetch profile summary from backend
  const { data: profileData, loading: profileLoading, error: profileError, execute: fetchProfileSummary } = useGetProfileSummary();

  // Update countdown timer every second
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilMidnight(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch profile data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfileSummary();
    }
  }, [isAuthenticated, user]);

  // Use real data from backend or fallback to defaults
  const userStats = profileData ? {
    rating: profileData.rating,
    rank: profileData.rank,
    maxRating: profileData.max_rating,
    globalRank: profileData.global_rank,
    countryRank: profileData.country_rank,
    problemsSolved: profileData.problems_solved,
    acceptanceRate: profileData.acceptance_rate
  } : {
    rating: 600,
    rank: 'Newbie',
    maxRating: 600,
    globalRank: null,
    countryRank: null,
    problemsSolved: 0,
    acceptanceRate: 0.0
  };

  const getRatingColor = (rating) => {
    if (rating >= 2100) return 'text-zinc-100';
    if (rating >= 1900) return 'text-zinc-200';
    if (rating >= 1600) return 'text-zinc-200';
    if (rating >= 1400) return 'text-zinc-300';
    return 'text-zinc-300';
  };

  const getRankBadgeColor = (rank) => {
    switch (rank.toLowerCase()) {
      case 'grandmaster': return 'bg-zinc-500';
      case 'master': return 'bg-zinc-600';
      case 'expert': return 'bg-zinc-600';
      case 'specialist': return 'bg-zinc-700';
      default: return 'bg-zinc-700';
    }
  };

  const getUserInitials = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Profile Info */}
        <div className="flex items-center space-x-5 flex-1">
          <div className="w-26 h-26 ml-5 mr-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            {getUserInitials()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100 truncate">{getFullName()}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRankBadgeColor(userStats.rank)} text-white`}>
                {userStats.rank}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-zinc-400 mb-3">
              <span className="text-base">@{user?.email?.split('@')[0] || 'username'}</span>
              {userStats.globalRank && (
                <>
                  <span>•</span>
                  <span>#{userStats.globalRank} globally</span>
                </>
              )}
              {profileLoading && (
                <>
                  <span>•</span>
                  <span>Loading...</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${getRatingColor(userStats.rating)}`}>
                  {userStats.rating}
                </span>
                <div className="text-zinc-400">
                  <div className="text-base">Rating</div>
                  <div className="text-sm">Max: {userStats.maxRating}</div>
                </div>
              </div>

              <div className="text-zinc-400 text-center">
                <div className="text-zinc-100 font-medium text-lg">{userStats.problemsSolved}</div>
                <div>Problems Solved</div>
              </div>

              <div className="text-zinc-400 text-center">
                <div className="text-zinc-100 font-medium text-lg">{userStats.acceptanceRate}%</div>
                <div>Acceptance Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Challenge Box */}
        <div className="md:min-w-[280px] ml-auto">
          <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-700/30 rounded-lg p-3">
            <div className="mb-2">
              <h3 className="text-orange-400 font-medium text-sm">Ready for today's challenge?</h3>
            </div>

            <div className="mb-3 space-y-1">
              <div className="flex items-center text-xs text-white">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~30 min estimated
              </div>
              <div className="flex items-center text-xs text-white">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Behavior tracking enabled
              </div>
              <div className="flex items-center text-xs text-white">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Two Sum - Arrays & Hash Tables
              </div>
            </div>

            <button
              onClick={onStartChallenge}
              className="
                w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                text-white rounded-lg transition-all duration-200 font-medium transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg hover:shadow-orange-500/25
              "
            >
              <div className="flex items-center justify-between">
                <div className="text-white text-xs font-mono bg-black/20 px-2 py-0.5 rounded">
                  {timeUntilMidnight}
                </div>
                <span className="flex-1 text-center">Start Challenge</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileHeader;
