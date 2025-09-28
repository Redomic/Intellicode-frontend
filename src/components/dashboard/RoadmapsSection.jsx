import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRoadmaps } from '../../hooks/useAPI';
import RoadmapTracker from '../../utils/roadmapTracker';

const RoadmapsSection = ({ onRoadmapChange }) => {
  const navigate = useNavigate();
  const { data: roadmapsData, loading, error, refetch } = useRoadmaps();
  const [activatedRoadmaps, setActivatedRoadmaps] = useState({});

  // Load activated roadmaps on component mount - MUST be at the top to avoid hooks order issues
  useEffect(() => {
    const loadActivatedRoadmaps = async () => {
      try {
        // Sync with backend and get active course (single course only)
        const activated = await RoadmapTracker.getActivatedRoadmaps();
        setActivatedRoadmaps(activated);
      } catch (error) {
        console.error('Failed to load active course:', error);
        // Fallback to localStorage
        const activated = RoadmapTracker.getActivatedRoadmapsSync();
        setActivatedRoadmaps(activated);
      }
    };
    
    loadActivatedRoadmaps();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    if (percentage >= 20) return 'from-orange-500 to-red-500';
    return 'from-zinc-600 to-zinc-700';
  };

  if (loading) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">Roadmaps</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-zinc-700 rounded mb-2"></div>
              <div className="h-2 bg-zinc-700 rounded mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">Roadmaps</h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-4">Failed to load roadmaps</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const roadmaps = roadmapsData?.roadmaps || [];

  const handleRoadmapClick = (roadmap) => {
    // Only allow navigation if roadmap is activated
    if (RoadmapTracker.isRoadmapActivated(roadmap.course)) {
      RoadmapTracker.setActiveRoadmap(roadmap.course, roadmap.course_name);
      // Notify parent component about the active roadmap change
      if (onRoadmapChange) {
        onRoadmapChange();
      }
      navigate(`/roadmap/${roadmap.course}`);
    }
  };

  const handleActivateRoadmap = async (e, roadmap) => {
    e.stopPropagation(); // Prevent roadmap click
    try {
      // This will replace any currently active roadmap (only one can be active)
      await RoadmapTracker.activateRoadmap(roadmap.course, roadmap.course_name);
      const activated = await RoadmapTracker.getActivatedRoadmaps();
      setActivatedRoadmaps(activated);
    } catch (error) {
      console.error('Failed to activate roadmap:', error);
      // Fallback to localStorage
      const activated = RoadmapTracker.getActivatedRoadmapsSync();
      setActivatedRoadmaps(activated);
    }
    
    // Notify parent component about the change
    if (onRoadmapChange) {
      onRoadmapChange();
    }
  };

  const handleDeactivateRoadmap = async (e, roadmap) => {
    e.stopPropagation(); // Prevent roadmap click
    try {
      await RoadmapTracker.deactivateRoadmap(roadmap.course);
      const activated = await RoadmapTracker.getActivatedRoadmaps();
      setActivatedRoadmaps(activated);
    } catch (error) {
      console.error('Failed to deactivate roadmap:', error);
      // Fallback to localStorage
      const activated = RoadmapTracker.getActivatedRoadmapsSync();
      setActivatedRoadmaps(activated);
    }
    
    // Notify parent component about the change
    if (onRoadmapChange) {
      onRoadmapChange();
    }
  };

  return (
    <motion.div 
      className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Roadmaps</h2>
        <span className="text-sm text-zinc-400">
          {roadmaps.length} course{roadmaps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Roadmaps Container - Horizontal Slider */}
      {roadmaps.length === 0 ? (
        <div className="text-center py-12">
          <svg 
            className="w-12 h-12 text-zinc-600 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-zinc-400">No roadmaps available yet</p>
          <p className="text-sm text-zinc-500 mt-2">Start practicing to see your progress!</p>
        </div>
      ) : (
        <div className="relative">
          {/* Horizontal Scrollable Container */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-1 py-3">
            {roadmaps.map((roadmap, index) => {
              const isActivated = !!activatedRoadmaps[roadmap.course];
              
              return (
                <motion.div
                  key={roadmap.course}
                  className={`group relative flex-shrink-0 w-64 p-5 border rounded-xl transition-all duration-300 z-10 ${
                    isActivated 
                      ? 'bg-gradient-to-br from-emerald-950/30 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-400/50 cursor-pointer'
                      : 'bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border-zinc-700/50 hover:border-zinc-600/50 cursor-default'
                  }`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleRoadmapClick(roadmap)}
                  whileHover={isActivated ? { scale: 1.02, y: -2 } : {}}
                  whileTap={isActivated ? { scale: 0.98 } : {}}
                >
                  {/* Activated Indicator */}
                  {isActivated && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center z-20 shadow-lg">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Course Content */}
                  <div className="flex flex-col h-full">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4 flex-1">
                      <h3 className={`font-semibold text-lg leading-tight transition-colors ${
                        isActivated 
                          ? 'text-emerald-100 group-hover:text-emerald-50' 
                          : 'text-zinc-100 group-hover:text-zinc-50'
                      }`}>
                        {roadmap.course_name}
                      </h3>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        isActivated 
                          ? 'text-emerald-200 bg-emerald-800/50' 
                          : 'text-zinc-300 bg-zinc-800/50'
                      }`}>
                        {roadmap.progress_percentage}%
                      </span>
                    </div>

                    {/* Progress Section */}
                    <div className="relative mt-auto">
                      <div className="flex justify-center mb-2">
                        <span className={`text-xs ${isActivated ? 'text-emerald-300' : 'text-zinc-400'}`}>
                          {roadmap.completed_questions}/{roadmap.total_questions} questions
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${
                        isActivated ? 'bg-emerald-900/50' : 'bg-zinc-700/80'
                      }`}>
                        <motion.div
                          className={`h-full shadow-lg ${
                            isActivated 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                              : `bg-gradient-to-r ${getProgressColor(roadmap.progress_percentage)}`
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${roadmap.progress_percentage}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                        />
                      </div>
                      
                      {/* Activation Button */}
                      <div className="mt-3 flex justify-center">
                        {isActivated ? (
                          <button
                            onClick={(e) => handleDeactivateRoadmap(e, roadmap)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-400/50 text-emerald-300 text-xs font-medium rounded-lg transition-all duration-200"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleActivateRoadmap(e, roadmap)}
                            className="px-3 py-1.5 bg-zinc-700/50 hover:bg-emerald-600/20 border border-zinc-600/50 hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-300 text-xs font-medium rounded-lg transition-all duration-200"
                            title="This will replace any currently active roadmap"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Glow */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    isActivated 
                      ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10'
                      : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                  }`} />
                </motion.div>
              );
            })}
          </div>

          {/* Scroll Indicators */}
          {roadmaps.length > 1 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {roadmaps.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-zinc-600 rounded-full opacity-50"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Note */}
      {roadmaps.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-700/50">
          <p className="text-xs text-zinc-500 text-center">
            Complete more problems to increase your progress
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RoadmapsSection;
