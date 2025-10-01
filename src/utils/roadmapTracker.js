/**
 * Utility functions for tracking user's active roadmap and progress
 * Now integrates with backend API for course activation
 * Progress tracking is done via backend only - no localStorage for user progress
 */

import courseActivationAPI from '../services/courseActivationAPI';

const STORAGE_KEYS = {
  ACTIVE_ROADMAP: 'intellicode_active_roadmap',
  ACTIVE_COURSE: 'intellicode_active_course', // Single course storage
};

export class RoadmapTracker {
  /**
   * Activate a roadmap for the user (backend integration) - Only one course can be active
   * @param {string} courseId - The course identifier (e.g., 'strivers-a2z')
   * @param {string} courseName - The display name of the course
   */
  static async activateRoadmap(courseId, courseName) {
    try {
      // Call backend API - this will replace any previously active course
      await courseActivationAPI.activateCourse(courseId);
      
      // Update local storage as backup - store single active course
      const activeCourse = {
        courseId,
        courseName,
        activatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE, JSON.stringify(activeCourse));
      
      // Also set as current active roadmap
      this.setActiveRoadmap(courseId, courseName);
    } catch (error) {
      console.error('Failed to activate roadmap on backend:', error);
      // Fallback to localStorage only
      const activeCourse = {
        courseId,
        courseName,
        activatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE, JSON.stringify(activeCourse));
      this.setActiveRoadmap(courseId, courseName);
    }
  }

  /**
   * Deactivate the currently active roadmap (backend integration)
   * @param {string} courseId - The course identifier to deactivate
   */
  static async deactivateRoadmap(courseId) {
    try {
      // Call backend API - will only deactivate if this course is currently active
      await courseActivationAPI.deactivateCourse(courseId);
      
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROADMAP);
    } catch (error) {
      console.error('Failed to deactivate roadmap on backend:', error);
      // Fallback to localStorage only - check if this course is currently active
      const activeCourse = this.getActiveCourseSync();
      if (activeCourse && activeCourse.courseId === courseId) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROADMAP);
      }
    }
  }

  /**
   * Check if a roadmap is the currently active course (synchronous check)
   * @param {string} courseId - The course identifier
   * @returns {boolean} - Whether this roadmap is the active course
   */
  static isRoadmapActivated(courseId) {
    const activeCourse = this.getActiveCourseSync();
    return activeCourse ? activeCourse.courseId === courseId : false;
  }

  /**
   * Check if a roadmap is the currently active course (async with backend sync)
   * @param {string} courseId - The course identifier
   * @returns {Promise<boolean>} - Whether this roadmap is the active course
   */
  static async isRoadmapActivatedAsync(courseId) {
    const activeCourse = await this.getActiveCourse();
    return activeCourse ? activeCourse.courseId === courseId : false;
  }

  /**
   * Get the currently active course (with backend sync)
   * @returns {Promise<Object|null>} - Active course data or null
   */
  static async getActiveCourse() {
    try {
      // Try to get from backend first
      const backendCourse = await courseActivationAPI.getActiveCourse();
      
      if (backendCourse) {
        const activeCourse = {
          courseId: backendCourse,
          courseName: backendCourse === 'strivers-a2z' ? "Striver's A2Z DSA Course" : 
                     backendCourse.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          activatedAt: new Date().toISOString()
        };
        
        // Update localStorage as backup
        localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE, JSON.stringify(activeCourse));
        return activeCourse;
      } else {
        // No active course, clear localStorage
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch active course from backend, using localStorage:', error);
      // Fallback to localStorage
      return this.getActiveCourseSync();
    }
  }

  /**
   * Get the currently active course synchronously (localStorage only)
   * @returns {Object|null} - Active course data or null
   */
  static getActiveCourseSync() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_COURSE);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Get activated roadmaps in the old format for backward compatibility
   * @returns {Promise<Object>} - Object mapping courseId to roadmap data
   */
  static async getActivatedRoadmaps() {
    const activeCourse = await this.getActiveCourse();
    if (!activeCourse) return {};
    
    // Convert single active course to old format
    return {
      [activeCourse.courseId]: activeCourse
    };
  }

  /**
   * Get activated roadmaps synchronously in the old format for backward compatibility
   * @returns {Object} - Object mapping courseId to roadmap data
   */
  static getActivatedRoadmapsSync() {
    const activeCourse = this.getActiveCourseSync();
    if (!activeCourse) return {};
    
    // Convert single active course to old format
    return {
      [activeCourse.courseId]: activeCourse
    };
  }

  /**
   * Set the user's currently active roadmap (same as active course)
   * @param {string} courseId - The course identifier (e.g., 'strivers-a2z')
   * @param {string} courseName - The display name of the course
   */
  static setActiveRoadmap(courseId, courseName) {
    const roadmapData = {
      courseId,
      courseName,
      setAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROADMAP, JSON.stringify(roadmapData));
  }

  /**
   * Get the user's currently active roadmap
   * @returns {Object|null} - The active roadmap data or null if none set
   */
  static getActiveRoadmap() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROADMAP);
    if (!stored) return null;
    
    try {
      const roadmap = JSON.parse(stored);
      // Verify it's still activated
      if (this.isRoadmapActivated(roadmap.courseId)) {
        return roadmap;
      } else {
        // Clear invalid active roadmap
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROADMAP);
        return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Get the active roadmap (same as getActiveCourse for single-course system)
   * @returns {Object|null} - The active roadmap or null
   */
  static getAnyActivatedRoadmap() {
    const activeRoadmap = this.getActiveRoadmap();
    if (activeRoadmap) return activeRoadmap;

    // Fallback to active course
    return this.getActiveCourseSync();
  }

  /**
   * Sync active course from backend
   * @returns {Promise<void>}
   */
  static async syncActivatedRoadmaps() {
    try {
      await this.getActiveCourse(); // This will sync and update localStorage
    } catch (error) {
      console.error('Failed to sync active course:', error);
    }
  }

  /**
   * Calculate unlocked levels based on completed levels
   * @param {Array|Set} completedStepNumbers - Array or Set of completed step numbers
   * @param {Array} allQuestions - All questions in the course for unlocking logic
   * @returns {Set} - Set of unlocked level numbers
   */
  static calculateUnlockedLevels(completedStepNumbers, allQuestions = []) {
    const completed = new Set(completedStepNumbers);
    const unlocked = new Set([1]); // First level is always unlocked
    
    if (allQuestions.length === 0) return unlocked;

    // Sort questions by step number
    const sortedQuestions = [...allQuestions].sort((a, b) => a.step_number - b.step_number);
    
    // For each completed question, unlock the next one
    for (const stepNumber of completed) {
      const currentIndex = sortedQuestions.findIndex(q => q.step_number === stepNumber);
      if (currentIndex !== -1 && currentIndex < sortedQuestions.length - 1) {
        const nextQuestion = sortedQuestions[currentIndex + 1];
        unlocked.add(nextQuestion.step_number);
      }
    }

    return unlocked;
  }

  /**
   * Find the next level the user should attempt
   * @param {Array|Set} completedStepNumbers - Array or Set of completed step numbers
   * @param {Array} questions - Array of questions from the roadmap
   * @returns {Object|null} - The next question to attempt or null if none
   */
  static getNextLevel(completedStepNumbers, questions) {
    if (!questions || questions.length === 0) {
      return null;
    }

    const completed = new Set(completedStepNumbers);
    const unlocked = this.calculateUnlockedLevels(completedStepNumbers, questions);

    // Sort questions by step_number
    const sortedQuestions = [...questions].sort((a, b) => a.step_number - b.step_number);

    // Find the first unlocked question that isn't completed
    for (const question of sortedQuestions) {
      if (unlocked.has(question.step_number) && !completed.has(question.step_number)) {
        return question;
      }
    }

    // If all unlocked questions are completed, return the first unlocked one for review
    for (const question of sortedQuestions) {
      if (unlocked.has(question.step_number)) {
        return question;
      }
    }

    return null;
  }


  /**
   * Get progress statistics
   * @param {Array|Set} completedStepNumbers - Array or Set of completed step numbers
   * @param {Array} questions - All questions in the roadmap
   * @returns {Object} - Progress statistics
   */
  static getProgressStats(completedStepNumbers, questions) {
    if (!questions || questions.length === 0) {
      return { totalLevels: 0, completedLevels: 0, unlockedLevels: 0, progressPercentage: 0 };
    }

    const completed = new Set(completedStepNumbers);
    const unlocked = this.calculateUnlockedLevels(completedStepNumbers, questions);

    return {
      totalLevels: questions.length,
      completedLevels: completed.size,
      unlockedLevels: unlocked.size,
      progressPercentage: questions.length > 0 ? Math.round((completed.size / questions.length) * 100) : 0
    };
  }

  /**
   * Clear all roadmap data (useful for testing or reset)
   */
  static clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROADMAP);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE);
  }
}

export default RoadmapTracker;
