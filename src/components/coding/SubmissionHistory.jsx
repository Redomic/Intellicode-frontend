import React, { useState, useEffect } from 'react';
import { useGetSubmissionHistory } from '../../services/api';

/**
 * SubmissionHistory - Shows user's past submissions for the current question
 * Professional, clean design without emojis
 */
const SubmissionHistory = ({ questionKey }) => {
  const [submissions, setSubmissions] = useState([]);
  const getHistoryHook = useGetSubmissionHistory();

  useEffect(() => {
    const loadHistory = async () => {
      if (!questionKey) return;
      
      try {
        const result = await getHistoryHook.execute({ question_key: questionKey, limit: 10 });
        if (result && Array.isArray(result)) {
          setSubmissions(result);
        }
      } catch (error) {
        console.error('Failed to load submission history:', error);
      }
    };

    loadHistory();
  }, [questionKey]);

  if (getHistoryHook.loading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-zinc-500 text-xs">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900 p-6">
        <div className="text-center max-w-sm">
          <svg className="w-12 h-12 mx-auto mb-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-zinc-400 font-medium mb-1">No Submissions Yet</h3>
          <p className="text-zinc-500 text-sm">Your submission history will appear here once you submit your first solution</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Wrong Answer':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Runtime Error':
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-900 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-300">Submission History</h3>
        <p className="text-xs text-zinc-500 mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-3">
        {submissions.map((submission, index) => (
          <div
            key={submission.key || index}
            className="bg-zinc-800 rounded-lg border border-zinc-700 p-3 hover:border-zinc-600 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
                <span className="text-xs text-zinc-500">{formatDate(submission.created_at)}</span>
              </div>
              
              {submission.language && (
                <span className="text-xs text-zinc-400 font-mono">{submission.language}</span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* Test Cases */}
              <div className="bg-zinc-900 rounded p-2">
                <div className="text-xs text-zinc-500 mb-1">Test Cases</div>
                <div className="text-sm font-semibold text-zinc-300">
                  {submission.passed_test_cases}/{submission.total_test_cases}
                  {submission.status === 'Accepted' && (
                    <span className="text-green-400 ml-1">Passed</span>
                  )}
                </div>
              </div>

              {/* Runtime */}
              {submission.runtime_ms && (
                <div className="bg-zinc-900 rounded p-2">
                  <div className="text-xs text-zinc-500 mb-1">Runtime</div>
                  <div className="text-sm font-semibold text-zinc-300">
                    {submission.runtime_ms}ms
                    {submission.runtime_percentile && (
                      <span className="text-xs text-zinc-500 ml-1">
                        ({submission.runtime_percentile.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error message (if failed) */}
            {submission.error_message && submission.status !== 'Accepted' && (
              <div className="mt-2 pt-2 border-t border-zinc-700">
                <p className="text-xs text-red-400 truncate" title={submission.error_message}>
                  {submission.error_message}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionHistory;
