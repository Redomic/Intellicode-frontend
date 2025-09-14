import React, { useState, useEffect } from 'react';

/**
 * PerformanceTracker - Real-time assessment performance tracking
 */
const PerformanceTracker = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  answers, 
  questionStartTime,
  currentQuestion,
  className = "" 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime]);

  // Calculate current performance metrics
  const calculateMetrics = () => {
    const answeredQuestions = Object.keys(answers).length;
    const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;
    const totalTime = Object.values(answers).reduce((sum, a) => sum + (a.timeTaken || 0), 0);
    
    const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
    const avgTime = answeredQuestions > 0 ? totalTime / answeredQuestions : 0;
    
    // Calculate estimated score components based on current performance
    const accuracyScore = accuracy * 0.4; // 40% weight
    const timeEfficiencyScore = Math.max(0, 100 - ((avgTime - 120) / 120) * 50) * 0.3; // 30% weight
    const difficultyBonus = currentQuestion?.difficulty === 'ADVANCED' ? 20 : 
                           currentQuestion?.difficulty === 'INTERMEDIATE' ? 10 : 5;
    const estimatedScore = accuracyScore + timeEfficiencyScore + (difficultyBonus * 0.2);

    return {
      accuracy,
      avgTime,
      estimatedScore: Math.max(0, Math.min(100, estimatedScore)),
      answeredQuestions,
      correctAnswers
    };
  };

  const metrics = calculateMetrics();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTimeColor = (time) => {
    if (time <= 120) return 'text-green-400'; // Under 2 minutes
    if (time <= 300) return 'text-yellow-400'; // Under 5 minutes
    return 'text-red-400'; // Over 5 minutes
  };

  return (
    <div className={`bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-zinc-300">Live Performance</h4>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-500">Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Current Question Timer */}
        <div className="text-center">
          <div className={`text-lg font-mono ${getTimeColor(elapsedTime)}`}>
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs text-zinc-500">Current Q</div>
        </div>

        {/* Accuracy */}
        <div className="text-center">
          <div className={`text-lg font-medium ${getPerformanceColor(metrics.accuracy)}`}>
            {metrics.accuracy.toFixed(0)}%
          </div>
          <div className="text-xs text-zinc-500">Accuracy</div>
        </div>

        {/* Average Time */}
        <div className="text-center">
          <div className={`text-lg font-medium ${getTimeColor(metrics.avgTime)}`}>
            {metrics.avgTime.toFixed(0)}s
          </div>
          <div className="text-xs text-zinc-500">Avg Time</div>
        </div>

        {/* Estimated Score */}
        <div className="text-center">
          <div className={`text-lg font-medium ${getPerformanceColor(metrics.estimatedScore)}`}>
            {metrics.estimatedScore.toFixed(0)}
          </div>
          <div className="text-xs text-zinc-500">Est. Score</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span>{currentQuestionIndex}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-1.5">
          <div 
            className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Feedback */}
      {metrics.answeredQuestions > 0 && (
        <div className="mt-3 p-2 bg-zinc-700/30 rounded text-center">
          <div className="text-xs text-zinc-400">
            {metrics.correctAnswers}/{metrics.answeredQuestions} correct
            {metrics.accuracy >= 80 && <span className="text-green-400 ml-1">🔥 Excellent!</span>}
            {metrics.accuracy >= 60 && metrics.accuracy < 80 && <span className="text-yellow-400 ml-1">👍 Good job!</span>}
            {metrics.accuracy < 60 && <span className="text-orange-400 ml-1">💪 Keep going!</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTracker;
