import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  LightBulbIcon,
  CodeBracketIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const SessionAnalytics = ({ 
  currentSession,
  sessionHistory,
  sessionAnalytics,
  sessionInsights,
  className = ''
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate analytics for different time frames
  const analytics = useMemo(() => {
    if (!sessionHistory?.length) return null;

    const now = new Date();
    const timeFrames = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      'all': Infinity
    };

    const daysToInclude = timeFrames[selectedTimeFrame];
    const cutoffDate = new Date(now.getTime() - (daysToInclude * 24 * 60 * 60 * 1000));

    const filteredSessions = sessionHistory.filter(session => {
      if (daysToInclude === Infinity) return true;
      const sessionDate = new Date(session.startTime);
      return sessionDate >= cutoffDate;
    });

    if (!filteredSessions.length) return null;

    const totalSessions = filteredSessions.length;
    const completedSessions = filteredSessions.filter(s => s.analytics?.isCompleted).length;
    const totalDuration = filteredSessions.reduce((sum, s) => sum + (s.analytics?.totalDuration || 0), 0);
    const averageDuration = totalDuration / totalSessions;
    const completionRate = (completedSessions / totalSessions) * 100;
    
    const totalCodeChanges = filteredSessions.reduce((sum, s) => sum + (s.analytics?.codeChanges || 0), 0);
    const totalTestsRun = filteredSessions.reduce((sum, s) => sum + (s.analytics?.testsRun || 0), 0);
    const totalHintsUsed = filteredSessions.reduce((sum, s) => sum + (s.analytics?.hintsUsed || 0), 0);

    // Calculate streaks
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const hasSessionOnDay = filteredSessions.some(session => {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime() && session.analytics?.isCompleted;
      });

      if (hasSessionOnDay) {
        currentStreak++;
      } else if (i > 0) { // Allow today to be empty
        break;
      }
    }

    // Performance trends
    const recentSessions = filteredSessions.slice(0, 5);
    const olderSessions = filteredSessions.slice(5, 10);
    
    const recentCompletionRate = recentSessions.length ? 
      (recentSessions.filter(s => s.analytics?.isCompleted).length / recentSessions.length) * 100 : 0;
    const olderCompletionRate = olderSessions.length ? 
      (olderSessions.filter(s => s.analytics?.isCompleted).length / olderSessions.length) * 100 : 0;
    
    const performanceTrend = recentCompletionRate > olderCompletionRate ? 'up' : 
                            recentCompletionRate < olderCompletionRate ? 'down' : 'stable';

    return {
      totalSessions,
      completedSessions,
      completionRate,
      averageDuration,
      totalDuration,
      currentStreak,
      totalCodeChanges,
      totalTestsRun,
      totalHintsUsed,
      performanceTrend,
      sessions: filteredSessions
    };
  }, [sessionHistory, selectedTimeFrame]);

  const formatDuration = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
      default:
        return <MinusIcon className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const timeFrameOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'performance', label: 'Performance', icon: TrophyIcon },
    { id: 'habits', label: 'Habits', icon: ClockIcon },
    { id: 'insights', label: 'Insights', icon: LightBulbIcon }
  ];

  return (
    <div className={`bg-zinc-800 border border-zinc-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-700">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Session Analytics</h2>
          <p className="text-sm text-zinc-400">Track your coding progress and performance</p>
        </div>

        {/* Time Frame Selector */}
        <div className="flex bg-zinc-900 rounded-lg p-1">
          {timeFrameOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeFrame(option.value)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedTimeFrame === option.value
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!analytics ? (
          <div className="text-center py-12">
            <ChartBarIcon className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No Data Available</h3>
            <p className="text-zinc-400">
              Complete some coding sessions to see your analytics.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                className="bg-zinc-900/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(analytics.performanceTrend)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-100">
                  {analytics.totalSessions}
                </div>
                <div className="text-sm text-zinc-400">Total Sessions</div>
              </motion.div>

              <motion.div
                className="bg-zinc-900/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-100">
                  {Math.round(analytics.completionRate)}%
                </div>
                <div className="text-sm text-zinc-400">Completion Rate</div>
              </motion.div>

              <motion.div
                className="bg-zinc-900/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <FireIcon className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-100">
                  {analytics.currentStreak}
                </div>
                <div className="text-sm text-zinc-400">Day Streak</div>
              </motion.div>

              <motion.div
                className="bg-zinc-900/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-100">
                  {formatDuration(analytics.averageDuration)}
                </div>
                <div className="text-sm text-zinc-400">Avg Duration</div>
              </motion.div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Summary */}
              <div className="bg-zinc-900/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Activity Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CodeBracketIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-zinc-300">Code Changes</span>
                    </div>
                    <span className="text-zinc-100 font-medium">
                      {analytics.totalCodeChanges.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-zinc-300">Tests Run</span>
                    </div>
                    <span className="text-zinc-100 font-medium">
                      {analytics.totalTestsRun.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <LightBulbIcon className="w-5 h-5 text-amber-400" />
                      <span className="text-zinc-300">Hints Used</span>
                    </div>
                    <span className="text-zinc-100 font-medium">
                      {analytics.totalHintsUsed.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-zinc-300">Total Time</span>
                    </div>
                    <span className="text-zinc-100 font-medium">
                      {formatDuration(analytics.totalDuration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="bg-zinc-900/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Overall Trend</span>
                    <div className={`flex items-center space-x-2 ${getTrendColor(analytics.performanceTrend)}`}>
                      {getTrendIcon(analytics.performanceTrend)}
                      <span className="font-medium capitalize">
                        {analytics.performanceTrend}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Completed Problems</span>
                    <span className="text-zinc-100 font-medium">
                      {analytics.completedSessions} / {analytics.totalSessions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Success Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-zinc-700 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analytics.completionRate}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${analytics.completionRate}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-zinc-100 font-medium text-sm">
                        {Math.round(analytics.completionRate)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-zinc-900/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-zinc-100 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {analytics.sessions.slice(0, 5).map((session, index) => (
                  <motion.div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        session.analytics?.isCompleted ? 'bg-green-400' : 'bg-zinc-400'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-zinc-100">
                          {session.questionTitle || 'Coding Challenge'}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {new Date(session.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-zinc-100">
                        {formatDuration(session.analytics?.totalDuration || 0)}
                      </div>
                      <div className="text-xs text-zinc-400 capitalize">
                        {session.type?.replace('_', ' ')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionAnalytics;
