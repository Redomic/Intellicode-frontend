import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CodingInterface from '../../components/coding/CodingInterface';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useRoadmapQuestions } from '../../hooks/useAPI';

/**
 * CodingPracticePage - Full page wrapper for the coding interface
 * Now supports both roadmap challenges (/challenge/{roadmap}/{questionId}) and general practice (/practice)
 */
const CodingPracticePage = () => {
  const { roadmap, questionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if we're resuming a session (state passed from Dashboard)
  const { resumeSession, sessionId } = location.state || {};
  
  // Log resume state for debugging
  useEffect(() => {
    if (resumeSession && sessionId) {
      console.log('📍 Resuming session:', sessionId, 'for question:', questionId);
    }
  }, [resumeSession, sessionId, questionId]);

  // Fetch roadmap questions if this is a roadmap challenge
  const { data: questionsData, loading: questionsLoading, error: questionsError } = useRoadmapQuestions(roadmap);
  const questions = questionsData || [];

  useEffect(() => {
    if (roadmap && questionId) {
      // This is a roadmap challenge - find the specific question from loaded questions
      console.log('🔍 Looking for question:', { roadmap, questionId, questionsCount: questions.length });
      
      setLoading(questionsLoading);
      setError(questionsError);

      if (questions.length > 0) {
        const question = questions.find(q => (q.key === questionId || q._key === questionId));
        console.log('📋 Question search result:', question ? 'Found' : 'Not found');
        console.log('📋 Available question keys:', questions.slice(0, 5).map(q => q.key || q._key));
        
        if (question) {
          setCurrentQuestion(question);
        } else {
          setError(`Question with ID "${questionId}" not found in roadmap "${roadmap}"`);
        }
      } else if (!questionsLoading && questions.length === 0) {
        console.warn('⚠️ No questions loaded from roadmap');
      }
    } else {
      // This is general practice - use legacy behavior (query params or sampleQuestions)
      const urlParams = new URLSearchParams(location.search);
      const questionParam = urlParams.get('question');
      const courseId = urlParams.get('courseId');
      
      if (questionParam && courseId) {
        // Legacy roadmap challenge via query params - redirect to new route
        navigate(`/challenge/${courseId}/${questionParam}`, { replace: true });
        return;
      }
      
      // General practice mode - let CodingInterface handle with sampleQuestions
      setCurrentQuestion(null);
      setLoading(false);
      setError(null);
    }
  }, [roadmap, questionId, questions, questionsLoading, questionsError, location.search, navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Failed to load challenge</p>
          <p className="text-sm text-zinc-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-900">
      {/* Coding Interface - pass roadmap question data if available */}
      <CodingInterface 
        roadmapQuestion={currentQuestion} 
        roadmapId={roadmap}
      />
    </div>
  );
};

export default CodingPracticePage;
