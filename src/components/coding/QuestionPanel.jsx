import React, { useState } from 'react';
import SkeletonLoader from '../ui/SkeletonLoader';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * QuestionPanel - Left panel displaying coding question details
 */
const QuestionPanel = ({ question, onQuestionChange, availableQuestions, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('problem');

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const tabs = [
    { id: 'problem', label: 'Problem' }
  ];

  if (isLoading) {
    return (
      <div className="h-full bg-zinc-900 flex flex-col">
        {/* Header Skeleton */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <SkeletonLoader width="60%" height="24px" />
            <SkeletonLoader width="60px" height="20px" className="rounded-full" />
          </div>
          <div className="flex space-x-2">
            <SkeletonLoader width="80px" height="20px" className="rounded" />
            <SkeletonLoader width="100px" height="20px" className="rounded" />
            <SkeletonLoader width="70px" height="20px" className="rounded" />
          </div>
        </div>

        {/* Tab Skeleton */}
        <div className="border-b border-zinc-700">
          <div className="px-4 py-3">
            <SkeletonLoader width="80px" height="20px" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <SkeletonLoader lines={4} />
            </div>
            
            <div className="space-y-4">
              <SkeletonLoader width="150px" height="24px" />
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <SkeletonLoader width="120px" height="20px" className="mb-3" />
                <div className="space-y-3">
                  <SkeletonLoader lines={2} />
                  <SkeletonLoader lines={2} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SkeletonLoader width="120px" height="24px" />
              <SkeletonLoader lines={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-zinc-400">No question selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-900 flex flex-col">
      {/* Question Header */}
      <div className="p-6 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-zinc-100">
            {question.id}. {question.title}
          </h2>
          <span className={`
            px-2 py-1 text-xs font-medium rounded border
            ${getDifficultyColor(question.difficulty)}
          `}>
            {question.difficulty}
          </span>
        </div>
        
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="
                  px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded
                  border border-zinc-600
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-700">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium transition-colors duration-200
                border-b-2 focus:outline-none
                ${activeTab === tab.id
                  ? 'text-blue-400 border-blue-400 bg-zinc-800/50'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/30'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'problem' && (
          <div className="space-y-8">
            {/* Description Section */}
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-zinc-300 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />
            </div>

            {/* Examples Section */}
            {question.examples && question.examples.length > 0 && (
              <>
                <div className="border-t border-zinc-700 pt-6">
                  <h4 className="text-zinc-100 font-medium mb-4 text-lg">Examples</h4>
                  <div className="space-y-6">
                    {question.examples.map((example, index) => (
                      <div key={index} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <h5 className="text-zinc-100 font-medium mb-3">Example {index + 1}:</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-zinc-400 text-sm font-medium">Input:</span>
                            <pre className="text-zinc-200 bg-zinc-900 p-3 rounded mt-1 text-sm overflow-x-auto">
                              {example.input}
                            </pre>
                          </div>
                          
                          <div>
                            <span className="text-zinc-400 text-sm font-medium">Output:</span>
                            <pre className="text-zinc-200 bg-zinc-900 p-3 rounded mt-1 text-sm overflow-x-auto">
                              {example.output}
                            </pre>
                          </div>
                          
                          {example.explanation && (
                            <div>
                              <span className="text-zinc-400 text-sm font-medium">Explanation:</span>
                              <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
                                {example.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Constraints Section */}
            {question.constraints && question.constraints.length > 0 && (
              <>
                <div className="border-t border-zinc-700 pt-6">
                  <h4 className="text-zinc-100 font-medium mb-4 text-lg">Constraints</h4>
                  <div className="space-y-2">
                    {question.constraints.map((constraint, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-zinc-500 mt-1 text-sm">•</span>
                        <code className="text-zinc-300 text-sm font-mono leading-relaxed">
                          {constraint}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Question Navigation */}
      {availableQuestions && availableQuestions.length > 1 && (
        <div className="border-t border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const currentIndex = availableQuestions.findIndex(q => q.id === question.id);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : availableQuestions.length - 1;
                onQuestionChange(availableQuestions[prevIndex].id);
              }}
              className="
                flex items-center space-x-2 px-3 py-2 text-sm text-zinc-400 
                hover:text-zinc-200 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <span className="text-xs text-zinc-500">
              {availableQuestions.findIndex(q => q.id === question.id) + 1} of {availableQuestions.length}
            </span>

            <button
              onClick={() => {
                const currentIndex = availableQuestions.findIndex(q => q.id === question.id);
                const nextIndex = currentIndex < availableQuestions.length - 1 ? currentIndex + 1 : 0;
                onQuestionChange(availableQuestions[nextIndex].id);
              }}
              className="
                flex items-center space-x-2 px-3 py-2 text-sm text-zinc-400 
                hover:text-zinc-200 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
              "
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
