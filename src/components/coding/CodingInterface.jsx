import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QuestionPanel from './QuestionPanel';
import CodeEditor from './CodeEditor';
import ProfileDropdown from '../ProfileDropdown';
import AIAssistantOrb from '../ui/AIAssistantOrb';
import { sampleQuestions } from '../../data/codingQuestions';

/**
 * CodingInterface - LeetCode-like coding interface
 * Layout: Question panel on left, code editor on right
 */
const CodingInterface = ({ questionId: initialQuestionId = null }) => {
  const location = useLocation();
  const sessionConfig = location.state?.sessionConfig;
  const challengeType = location.state?.challengeType;
  const specificProblemId = location.state?.specificProblemId;
  
  // Determine initial question ID based on route state or prop
  const getInitialQuestionId = () => {
    if (specificProblemId) return specificProblemId;
    if (initialQuestionId) return initialQuestionId;
    return sampleQuestions.length > 0 ? sampleQuestions[0].id : null;
  };
  
  const [selectedQuestionId, setSelectedQuestionId] = useState(getInitialQuestionId());
  const [language, setLanguage] = useState('python');
  const [isFullscreen, setIsFullscreen] = useState(sessionConfig?.fullscreenActivated || false);

  const selectedQuestion = sampleQuestions.find(q => q.id === selectedQuestionId);

  const handleQuestionChange = (questionId) => {
    setSelectedQuestionId(questionId);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  if (!selectedQuestion) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-zinc-100 mb-2">No Questions Available</h2>
          <p className="text-zinc-400">Please add some coding questions to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} flex flex-col`}>
      {/* Header - Acts as Navbar */}
      <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-3 flex items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-lg font-medium text-zinc-100">IntelliCode</h1>
        </div>

        {/* Center Section - AI Assistant */}
        <div className="flex justify-center">
          <div className="relative group">
            <AIAssistantOrb size="md" isActive={true} />
            {/* Hover Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {/* Tooltip Arrow */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-zinc-700"></div>
              <div className="text-center">
                <div className="font-medium text-blue-400">AI Assistant</div>
                <div className="text-zinc-300 mt-0.5">Ready to help with coding</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="
                bg-zinc-700 text-zinc-100 text-sm px-3 py-1 rounded border border-zinc-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="
              p-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
            "
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel - Left Side */}
        <div className="w-1/2 border-r border-zinc-700 overflow-hidden">
          <QuestionPanel 
            question={selectedQuestion}
            onQuestionChange={handleQuestionChange}
            availableQuestions={sampleQuestions}
          />
        </div>

        {/* Code Editor Panel - Right Side */}
        <div className="w-1/2 overflow-hidden">
          <CodeEditor
            question={selectedQuestion}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CodingInterface;
