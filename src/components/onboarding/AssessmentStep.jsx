import React, { useState, useEffect, useCallback, useRef } from 'react';
import useAxios from '../../hooks/useAxios';
import useAuth from '../../hooks/useAuth';
import PerformanceTracker from './PerformanceTracker';
import api from '../../utils/axios';

/**
 * AssessmentStep - New step for skill assessment after skill level selection
 */
const AssessmentStep = ({ data, onNext, onBack, canGoBack, stepIndex }) => {
  const { currentUser } = useAuth();
  
  // Debug logging
  console.log('AssessmentStep render:', { 
    currentUser: currentUser, 
    userKey: currentUser?._key || currentUser?.key,
    fullUser: JSON.stringify(currentUser, null, 2)
  });
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  
  // API hooks for different operations
  const createAssessmentHook = useAxios('', { method: 'POST', immediate: false });
  const submitAnswerHook = useAxios('', { method: 'POST', immediate: false });
  const completeAssessmentHook = useAxios('', { method: 'POST', immediate: false });
  const getQuestionHook = useAxios('', { method: 'GET', immediate: false });
  
  // Only check loading state when we're actually making requests
  const loading = createAssessmentHook.loading || submitAnswerHook.loading || completeAssessmentHook.loading || getQuestionHook.loading;
  const error = createAssessmentHook.error || submitAnswerHook.error || completeAssessmentHook.error || getQuestionHook.error;

  // Track if assessment creation has been attempted to prevent multiple calls
  const hasAttemptedCreateRef = useRef(false);
  
  // Reset attempt ref on unmount
  useEffect(() => {
    return () => {
      hasAttemptedCreateRef.current = false;
    };
  }, []);

  const createAssessment = useCallback(async () => {
    const userKey = currentUser?._key || currentUser?.key;
    console.log('createAssessment called:', { 
      currentUser, 
      userKey, 
      hasKey: !!userKey,
      skillLevel: data.skillLevel 
    });
    
    if (!userKey) {
      console.error('Cannot create assessment: User not authenticated or missing key');
      console.error('currentUser object:', currentUser);
      return;
    }

    try {
      const response = await createAssessmentHook.execute(
        {}, // Empty body for POST
        `/assessments/onboarding/${userKey}?claimed_skill_level=${data.skillLevel}`
      );
      
      if (response) {
        console.log('Raw assessment response:', response); // Debug log
        // Ensure we have the key field properly set
        // Backend returns _key due to Field(alias="_key") in Pydantic model
        const assessmentWithKey = {
          ...response,
          key: response._key || response.key || response.id
        };
        console.log('Assessment with key:', assessmentWithKey); // Debug log
        
        if (!assessmentWithKey.key) {
          console.error('No key found in assessment response!', response);
          return;
        }
        
        setAssessmentData(assessmentWithKey);
        setQuestionStartTime(Date.now());
        // Fetch the actual questions after creating assessment
        try {
          console.log('Fetching questions for keys:', response.question_keys);
          const questionsPromises = response.question_keys.map(async (key) => {
            try {
              const questionResponse = await api.get(`/questions/${key}`);
              return questionResponse.data;
            } catch (err) {
              console.error(`Failed to fetch question ${key}:`, err);
              return null;
            }
          });
          const questions = await Promise.all(questionsPromises);
          const validQuestions = questions.filter(q => q !== null);
          console.log('Fetched questions:', validQuestions);
          setQuestionsData(validQuestions);
        } catch (questionsErr) {
          console.error('Failed to fetch questions:', questionsErr);
        }
      }
    } catch (err) {
      console.error('Failed to create assessment:', err);
      
      // Handle specific error cases for strict onboarding validation
      if (err.response?.status === 400) {
        const errorDetail = err.response?.data?.detail || '';
        
        if (errorDetail.includes('already completed onboarding') || 
            errorDetail.includes('already completed an onboarding assessment')) {
          // User has already completed onboarding - redirect to dashboard
          console.log('User has already completed onboarding, redirecting to dashboard...');
          onNext({ skipToCompletion: true });
          return;
        }
      }
      
      // For other errors, show the error state which will allow retry
    }
  }, [currentUser?._key, currentUser?.key, data.skillLevel, onNext, createAssessmentHook]);

  useEffect(() => {
    setIsVisible(true);
    const userKey = currentUser?._key || currentUser?.key;
    
    // Only create assessment if we have all required data and haven't attempted yet
    if (data.skillLevel && userKey && !hasAttemptedCreateRef.current && !assessmentData) {
      console.log('Triggering assessment creation:', { userKey, skillLevel: data.skillLevel });
      hasAttemptedCreateRef.current = true;
      createAssessment();
    }
  }, [data.skillLevel, currentUser, createAssessment, assessmentData]);

  const submitAnswer = async () => {
    if (!selectedAnswer || !assessmentData) {
      console.error('Cannot submit answer:', { selectedAnswer, assessmentData });
      return;
    }

    console.log('Submitting answer for assessment:', assessmentData.key); // Debug log
    setIsSubmitting(true);
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const answerData = {
      question_key: assessmentData.question_keys[currentQuestionIndex],
      time_taken_seconds: timeTaken,
      is_correct: false, // This will be calculated by the backend
      points_earned: 0, // This will be calculated by the backend
      answer_data: {
        selected_option: selectedAnswer
      }
    };

    console.log('Answer data:', answerData); // Debug log

    try {
      const response = await submitAnswerHook.execute(
        answerData,
        `/assessments/${assessmentData.key}/answers`
      );

      if (response) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: {
            selected: selectedAnswer,
            timeTaken: timeTaken,
            isCorrect: response.user_answers[response.user_answers.length - 1]?.is_correct || false,
            pointsEarned: response.user_answers[response.user_answers.length - 1]?.points_earned || 0
          }
        }));

        // Move to next question or complete assessment
        if (currentQuestionIndex + 1 < assessmentData.total_questions) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setQuestionStartTime(Date.now());
        } else {
          // Complete the assessment
          await completeAssessment();
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      console.error('Submit answer error details:', {
        assessmentKey: assessmentData?.key,
        questionIndex: currentQuestionIndex,
        selectedAnswer,
        answerData
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeAssessment = async () => {
    try {
      console.log('Completing assessment:', assessmentData.key); // Debug log
      const response = await completeAssessmentHook.execute(
        {},
        `/assessments/${assessmentData.key}/complete?claimed_skill_level=${data.skillLevel}`
      );

      if (response) {
        console.log('Assessment completed:', response); // Debug log
        setFinalResult(response);
        setAssessmentCompleted(true);
      }
    } catch (err) {
      console.error('Failed to complete assessment:', err);
    }
  };

  const handleContinue = () => {
    if (finalResult) {
      onNext({ 
        assessmentResult: finalResult,
        expertiseRank: finalResult.calculated_expertise_rank
      });
    }
  };

  // Get current question from real data
  const getCurrentQuestion = () => {
    console.log('getCurrentQuestion called:', {
      questionsData: questionsData,
      questionsDataLength: questionsData?.length,
      currentQuestionIndex,
      hasQuestions: !!questionsData && questionsData.length > 0
    });
    
    if (!questionsData || currentQuestionIndex >= questionsData.length) {
      console.log('No questions available or index out of bounds');
      return null;
    }

    const question = questionsData[currentQuestionIndex];
    console.log('Current question:', question);
    
    if (!question) return null;

    // Transform backend question format to frontend format
    const transformedQuestion = {
      title: question.title,
      description: question.description,
      options: question.content?.options || [],
      points: question.points,
      estimated_time: question.estimated_time_minutes,
      difficulty: question.difficulty
    };
    
    console.log('Transformed question:', transformedQuestion);
    return transformedQuestion;
  };

  const currentQuestion = getCurrentQuestion();

  const userKey = currentUser?._key || currentUser?.key;
  
  if (!userKey) {
    return (
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-500 border-t-zinc-300 rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-400">Authenticating user...</p>
        {/* Debug info */}
        <div className="mt-4 text-xs text-zinc-600">
          Debug: currentUser = {currentUser ? 'exists' : 'null'}, 
          keys = _key:{currentUser?._key || 'none'}, key:{currentUser?.key || 'none'}
        </div>
      </div>
    );
  }

  // Show loading only when actually creating assessment or when we don't have assessment data yet
  const shouldShowLoading = (loading && !assessmentData) || (!assessmentData && hasAttemptedCreateRef.current && !error);
  
  if (shouldShowLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-500 border-t-zinc-300 rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-400">Preparing your assessment...</p>
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-zinc-600">
            Debug: loading={loading.toString()}, hasAssessment={!!assessmentData}, attempted={hasAttemptedCreateRef.current.toString()}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p>Failed to load assessment</p>
          <p className="text-sm text-zinc-500 mt-2">{typeof error === 'string' ? error : 'Please try again'}</p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => {
              hasAttemptedCreateRef.current = false;
              createAssessment();
            }}
            className="px-6 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors"
          >
            Try Again
          </button>
          {canGoBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              ← Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (assessmentCompleted && finalResult) {
    return (
      <div className={`
        text-center transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>
        {/* Assessment Complete Header */}
        <div className="mb-12">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-thin tracking-tight text-zinc-100 mb-4">
            Assessment Complete!
          </h1>
          <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
            Based on your performance, we've calculated your expertise ranking.
          </p>
        </div>

        {/* Results Summary */}
        <div className="max-w-2xl mx-auto mb-12 space-y-6">
          {/* Expertise Rank */}
          <div className="p-8 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <h3 className="text-xl font-medium text-zinc-100 mb-4">Your Expertise Rank</h3>
            <div className="text-6xl font-light text-zinc-100 mb-2">
              {finalResult.calculated_expertise_rank}
            </div>
            <p className="text-zinc-400">
              {finalResult.calculated_expertise_rank < 800 ? 'Beginner Level' :
               finalResult.calculated_expertise_rank < 1200 ? 'Intermediate Level' :
               finalResult.calculated_expertise_rank < 1800 ? 'Advanced Level' : 'Expert Level'}
            </p>
            {finalResult.rank_change && (
              <div className={`mt-3 flex items-center justify-center text-sm ${
                finalResult.rank_change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <svg className={`w-4 h-4 mr-1 ${finalResult.rank_change > 0 ? 'rotate-0' : 'rotate-180'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                {Math.abs(finalResult.rank_change)} points
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
              <div className="text-2xl font-light text-orange-400 mb-1">
                {finalResult.accuracy_percentage.toFixed(0)}%
              </div>
              <p className="text-zinc-400 text-sm">Accuracy</p>
              <div className="text-xs text-zinc-500 mt-1">40% weight</div>
            </div>
            <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
              <div className="text-2xl font-light text-orange-300 mb-1">
                {Math.round(finalResult.average_time_per_question)}s
              </div>
              <p className="text-zinc-400 text-sm">Avg Time</p>
              <div className="text-xs text-zinc-500 mt-1">30% weight</div>
            </div>
            <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
              <div className="text-2xl font-light text-orange-200 mb-1">
                {finalResult.total_points_earned}
              </div>
              <p className="text-zinc-400 text-sm">Points</p>
              <div className="text-xs text-zinc-500 mt-1">20% weight</div>
            </div>
            <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
              <div className="text-2xl font-light text-orange-400 mb-1">
                {finalResult.questions_answered}
              </div>
              <p className="text-zinc-400 text-sm">Completed</p>
              <div className="text-xs text-zinc-500 mt-1">10% weight</div>
            </div>
          </div>

          {/* Feedback */}
          {(finalResult.strongest_skills?.length > 0 || finalResult.areas_for_improvement?.length > 0) && (
            <div className="p-6 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-left">
              <h4 className="text-lg font-medium text-zinc-100 mb-4">Feedback</h4>
              {finalResult.strongest_skills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-green-400 text-sm font-medium mb-1">Strengths:</p>
                  <p className="text-zinc-300 text-sm">{finalResult.strongest_skills.join(', ')}</p>
                </div>
              )}
              {finalResult.areas_for_improvement?.length > 0 && (
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Areas to improve:</p>
                  <p className="text-zinc-300 text-sm">{finalResult.areas_for_improvement.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          {canGoBack && (
            <button
              onClick={onBack}
              className="
                px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                rounded-lg hover:bg-zinc-800/50
              "
            >
              ← Back
            </button>
          )}
          
          <button
            onClick={handleContinue}
            className="
              px-8 py-3 font-medium rounded-lg transition-all duration-300 ease-out
              transform hover:scale-105 hover:-translate-y-0.5
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
              bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg shadow-zinc-900/25
              ml-auto
            "
          >
            Continue to Completion
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-500 border-t-zinc-300 rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading question...</p>
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-zinc-600">
            Debug: assessmentData={!!assessmentData}, questionsData.length={questionsData?.length || 0}, currentIndex={currentQuestionIndex}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`
      text-center transform transition-all duration-1000 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* Header */}
      <div className={`
        mb-12 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '200ms'}}>
        <h1 className="text-4xl font-thin tracking-tight text-zinc-100 mb-4">
          Quick Assessment
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto mb-6">
          Let's see what you know! Answer these questions to help us set your starting level.
        </p>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <span className="text-zinc-500 text-sm">
            Question {currentQuestionIndex + 1} of {assessmentData?.total_questions || questionsData.length}
          </span>
          {currentQuestion?.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentQuestion.difficulty === 'BEGINNER' ? 'bg-green-900/30 text-green-400' :
              currentQuestion.difficulty === 'INTERMEDIATE' ? 'bg-yellow-900/30 text-yellow-400' :
              'bg-red-900/30 text-red-400'
            }`}>
              {currentQuestion.difficulty}
            </span>
          )}
          {currentQuestion?.points && (
            <span className="text-zinc-500 text-xs">
              {currentQuestion.points} pts
            </span>
          )}
        </div>
        <div className="w-64 h-2 bg-zinc-800 rounded-full mx-auto">
          <div 
            className="h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / (assessmentData?.total_questions || questionsData.length)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question and Performance */}
      <div className={`
        max-w-6xl mx-auto mb-12 transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '400ms'}}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question */}
          <div className="lg:col-span-3">
            <div className="p-8 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-left">
              <h3 className="text-xl font-medium text-zinc-100 mb-4">{currentQuestion.title}</h3>
              <p className="text-zinc-300 mb-6 leading-relaxed">{currentQuestion.description}</p>
              
              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedAnswer(option.key)}
                    disabled={isSubmitting}
                    className={`
                      w-full p-4 text-left rounded-lg border transition-all duration-200
                      ${selectedAnswer === option.key
                        ? 'bg-orange-900/30 border-orange-500 text-zinc-100'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700/50'
                      }
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                    `}
                  >
                    <div className="flex items-start">
                      <span className={`
                        inline-flex items-center justify-center w-6 h-6 rounded-full border mr-3 mt-0.5 text-xs font-medium
                        ${selectedAnswer === option.key
                          ? 'bg-orange-500 border-orange-400 text-white'
                          : 'border-zinc-600 text-zinc-400'
                        }
                      `}>
                        {option.key}
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Tracker */}
          <div className="lg:col-span-1">
            <PerformanceTracker
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={assessmentData?.total_questions || questionsData.length}
              answers={answers}
              questionStartTime={questionStartTime}
              currentQuestion={currentQuestion}
              className="sticky top-6"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`
        flex items-center justify-between max-w-md mx-auto
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `} style={{animationDelay: '600ms'}}>
        {canGoBack && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="
              px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
              rounded-lg hover:bg-zinc-800/50 disabled:opacity-50
            "
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer || isSubmitting}
          className={`
            px-8 py-3 font-medium rounded-lg transition-all duration-300 ease-out
            transform hover:scale-105 hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
            ${selectedAnswer && !isSubmitting
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg shadow-zinc-900/25'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }
            ${!canGoBack ? 'ml-auto' : ''}
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full mr-2"></div>
              Submitting...
            </div>
          ) : selectedAnswer ? (
            currentQuestionIndex + 1 < (assessmentData?.total_questions || questionsData.length) ? 'Next Question' : 'Complete Assessment'
          ) : (
            'Select an answer'
          )}
        </button>
      </div>
    </div>
  );
};

export default AssessmentStep;
