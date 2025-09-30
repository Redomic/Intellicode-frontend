import useAxios from '../hooks/useAxios';

/**
 * API service hooks using useAxios for consistent API patterns
 */

// Authentication API hooks
export const useLogin = () => useAxios('/auth/login', { method: 'POST', immediate: false });
export const useRegister = () => useAxios('/auth/register', { method: 'POST', immediate: false });
export const useGetCurrentUser = () => useAxios('/auth/me', { method: 'GET', immediate: false });
export const useRefreshToken = () => useAxios('/auth/token', { method: 'POST', immediate: false });

// User API hooks
export const useGetProfile = () => useAxios('/auth/me', { method: 'GET', immediate: false });
export const useUpdateProfile = () => useAxios('/users/profile', { method: 'PUT', immediate: false });
export const useUpdateSkillLevel = () => useAxios('/users/skill-level', { method: 'PATCH', immediate: false });

// Problems API hooks
export const useGetProblems = (params = {}) => useAxios('/problems', { 
  method: 'GET', 
  data: params,
  deps: [JSON.stringify(params)]
});
export const useGetProblem = (id) => useAxios(`/problems/${id}`, { 
  method: 'GET',
  immediate: !!id,
  deps: [id]
});
export const useSubmitSolution = () => useAxios('/submissions/submit', { method: 'POST', immediate: false });
export const useRunCode = () => useAxios('/submissions/run', { method: 'POST', immediate: false });
export const useGetSubmissionHistory = () => {
  const hook = useAxios('/submissions/history', { method: 'GET', immediate: false });
  
  return {
    ...hook,
    execute: async (params = {}) => {
      // Pass params directly - useAxios will handle them as query parameters
      return hook.execute(params);
    }
  };
};
export const useGetSubmission = (id) => useAxios(`/submissions/${id}`, { 
  method: 'GET',
  immediate: !!id,
  deps: [id]
});

// Progress API hooks
export const useGetProgress = () => useAxios('/progress', { method: 'GET' });
export const useUpdateProgress = () => useAxios('/progress', { method: 'POST', immediate: false });
export const useGetStats = () => useAxios('/progress/stats', { method: 'GET' });

// Assessment API hooks
export const useCreateAssessment = () => useAxios('/assessments', { method: 'POST', immediate: false });
export const useGetAssessment = (id) => useAxios(`/assessments/${id}`, { 
  method: 'GET',
  immediate: !!id,
  deps: [id]
});
export const useSubmitAnswer = () => useAxios('', { method: 'POST', immediate: false });
export const useCompleteAssessment = () => useAxios('', { method: 'POST', immediate: false });

// Questions API hooks
export const useGetQuestions = () => useAxios('/questions', { method: 'GET', immediate: false });
export const useGetQuestion = (id) => useAxios(`/questions/${id}`, { 
  method: 'GET',
  immediate: !!id,
  deps: [id]
});
export const useGetAssessmentQuestions = () => useAxios('', { method: 'GET', immediate: false });

// Dashboard API hooks
export const useGetDashboardStats = () => useAxios('/dashboard/stats', { method: 'GET', immediate: false });
export const useGetUserStreak = () => useAxios('/dashboard/streak', { method: 'GET', immediate: false });
export const useGetContributionHeatmap = (days = 365) => useAxios(`/dashboard/contribution-heatmap?days=${days}`, { 
  method: 'GET',
  immediate: false,
  deps: [days]
});
export const useGetProfileSummary = () => useAxios('/dashboard/profile-summary', { method: 'GET', immediate: false });
export const useGetUserRankings = () => useAxios('/dashboard/rankings', { method: 'GET', immediate: false });
export const useRecordSession = () => useAxios('/dashboard/record-session', { method: 'POST', immediate: false });
export const useGetUserSessions = (params = {}) => useAxios('/dashboard/sessions', { 
  method: 'GET',
  immediate: false,
  data: params,
  deps: [JSON.stringify(params)]
});

// Grouped exports for backward compatibility
export const authAPI = {
  useLogin,
  useRegister,
  useGetCurrentUser,
  useRefreshToken,
};

export const userAPI = {
  useGetProfile,
  useUpdateProfile,
  useUpdateSkillLevel,
};

export const problemsAPI = {
  useGetProblems,
  useGetProblem,
  useSubmitSolution,
  useRunCode,
  useGetSubmissionHistory,
  useGetSubmission,
};

export const progressAPI = {
  useGetProgress,
  useUpdateProgress,
  useGetStats,
};

export const assessmentAPI = {
  useCreateAssessment,
  useGetAssessment,
  useSubmitAnswer,
  useCompleteAssessment,
};

export const questionsAPI = {
  useGetQuestions,
  useGetQuestion,
  useGetAssessmentQuestions,
};

export const dashboardAPI = {
  useGetDashboardStats,
  useGetUserStreak,
  useGetContributionHeatmap,
  useGetProfileSummary,
  useGetUserRankings,
  useRecordSession,
  useGetUserSessions,
};

export default {
  auth: authAPI,
  user: userAPI,
  problems: problemsAPI,
  progress: progressAPI,
  assessment: assessmentAPI,
  questions: questionsAPI,
  dashboard: dashboardAPI,
};
