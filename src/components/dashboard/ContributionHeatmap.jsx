import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/userSlice';
import { useGetContributionHeatmap } from '../../services/api';

/**
 * ContributionHeatmap - GitHub-style contribution heatmap for coding activity
 */
const ContributionHeatmap = ({ user }) => {
  // Check authentication state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  
  // Fetch contribution data from backend
  const { data: heatmapData, loading: heatmapLoading, error: heatmapError, execute: fetchHeatmapData } = useGetContributionHeatmap(365);

  // Fetch heatmap data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchHeatmapData();
    }
  }, [isAuthenticated, currentUser]);
  
  // Use backend data or fallback to empty data
  const contributionData = heatmapData?.days || [];
  const [hoveredDay, setHoveredDay] = useState(null);

  // Group data by weeks
  const groupByWeeks = (data) => {
    const weeks = [];
    let currentWeek = [];
    
    data.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = groupByWeeks(contributionData);
  
  // Use backend calculated statistics or calculate from frontend data
  const totalContributions = heatmapData?.total_contributions || contributionData.reduce((sum, day) => sum + day.count, 0);
  const activeContributionDays = heatmapData?.active_days || contributionData.filter(day => day.count > 0).length;
  const bestDay = heatmapData?.best_day || (contributionData.length > 0 ? Math.max(...contributionData.map(d => d.count)) : 0);
  const dailyAverage = heatmapData?.daily_average || (contributionData.length > 0 ? totalContributions / contributionData.length : 0);

  const getIntensityColor = (level) => {
    switch (level) {
      case 0: return 'bg-zinc-800 border-zinc-700';
      case 1: return 'bg-orange-900/60 border-orange-800/60';
      case 2: return 'bg-orange-700/80 border-orange-600/80';
      case 3: return 'bg-orange-500 border-orange-400';
      case 4: return 'bg-gradient-to-br from-orange-400 to-yellow-400 border-orange-300';
      default: return 'bg-zinc-800 border-zinc-700';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    return months;
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-orange-100">Coding Activity</h3>
        <div className="text-zinc-400 text-sm">
          {heatmapLoading 
            ? "Loading activity..."
            : heatmapError 
            ? "Error loading data"
            : `${totalContributions} problems solved in the last year`
          }
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="relative">
        <div className="flex">
          {/* Day of Week Labels */}
          <div className="flex flex-col text-xs text-zinc-500 mr-2">
            <div className="h-4 mb-2"></div> {/* Space for month labels */}
            <div className="h-3 mb-1"></div>
            <div className="h-3 mb-1">Mon</div>
            <div className="h-3 mb-1"></div>
            <div className="h-3 mb-1">Wed</div>
            <div className="h-3 mb-1"></div>
            <div className="h-3 mb-1">Fri</div>
            <div className="h-3 mb-1"></div>
          </div>

          {/* Scrollable container for both month labels and contribution squares */}
          <div className="overflow-x-auto">
            <div className="flex flex-col">
              {/* Month Labels - now inside scrollable container */}
              <div className="flex text-xs text-zinc-500 mb-2 min-w-max">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="w-3 mr-1 text-left">
                    {weekIndex % 4 === 0 && weeks[weekIndex] && weeks[weekIndex][0] ? 
                      new Date(weeks[weekIndex][0].date).toLocaleDateString('en-US', { month: 'short' }) : ''}
                  </div>
                ))}
              </div>

              {/* Contribution Squares */}
              <div className="flex min-w-max">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col mr-1">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = week.find(d => new Date(d.date).getDay() === dayIndex);
                      return (
                        <div
                          key={dayIndex}
                          className={`
                            w-3 h-3 mb-1 border rounded-sm cursor-pointer transition-all duration-200
                            ${day ? getIntensityColor(day.level) : 'bg-zinc-800 border-zinc-700'}
                            hover:ring-2 hover:ring-orange-400 hover:ring-opacity-50 hover:scale-110
                          `}
                          onMouseEnter={() => day && setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          title={day ? `${day.count} problems solved on ${formatDate(day.date)}` : ''}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 text-zinc-100 text-sm rounded shadow-lg border border-zinc-700 z-10 whitespace-nowrap">
            <div className="font-medium">
              {hoveredDay.count} problem{hoveredDay.count !== 1 ? 's' : ''} solved
            </div>
            <div className="text-zinc-400 text-xs">
              {formatDate(hoveredDay.date)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
        <div>
          {activeContributionDays} active days
        </div>
        <div className="flex items-center space-x-1">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-3 h-3 border rounded-sm ${getIntensityColor(level)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-zinc-700">
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">
            {heatmapLoading ? "..." : totalContributions}
          </div>
          <div className="text-zinc-400 text-sm">Total Problems</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-300">
            {heatmapLoading ? "..." : activeContributionDays}
          </div>
          <div className="text-zinc-400 text-sm">Active Days</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-200">
            {heatmapLoading ? "..." : Math.round(dailyAverage * 10) / 10}
          </div>
          <div className="text-zinc-400 text-sm">Daily Average</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">
            {heatmapLoading ? "..." : bestDay}
          </div>
          <div className="text-zinc-400 text-sm">Best Day</div>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
