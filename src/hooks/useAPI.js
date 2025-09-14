import useAxios from './useAxios';

/**
 * Collection of specific API hooks for common operations
 */

// User-related hooks
export const useUser = () => {
  return useAxios('/auth/me', { immediate: false });
};

export const useUpdateProfile = () => {
  return useAxios('/users/profile', { method: 'PUT', immediate: false });
};

// Problem-related hooks (for future use)
export const useProblems = (params = {}) => {
  return useAxios('/problems', { 
    method: 'GET', 
    data: params,
    deps: [JSON.stringify(params)]
  });
};

export const useProblem = (id) => {
  return useAxios(`/problems/${id}`, { 
    immediate: !!id,
    deps: [id]
  });
};

export const useSubmitSolution = () => {
  return useAxios('/problems/submit', { method: 'POST', immediate: false });
};

// Progress-related hooks (for future use)
export const useProgress = () => {
  return useAxios('/progress');
};

export const useStats = () => {
  return useAxios('/progress/stats');
};

export default {
  useUser,
  useUpdateProfile,
  useProblems,
  useProblem,
  useSubmitSolution,
  useProgress,
  useStats,
};
