import api from '../utils/axios';

/**
 * Course activation API service
 */
export const courseActivationAPI = {
  /**
   * Get user's active course
   * @returns {Promise<string|null>} Active course ID or null
   */
  async getActiveCourse() {
    try {
      const response = await api.get('/users/courses/active');
      return response.data.active_course;
    } catch (error) {
      console.error('Failed to fetch active course:', error);
      throw error;
    }
  },

  /**
   * Activate a course for the user
   * @param {string} courseId - Course ID to activate
   * @returns {Promise<Object>} Activation response
   */
  async activateCourse(courseId) {
    try {
      const response = await api.post('/users/courses/activate', {
        course_id: courseId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to activate course:', error);
      throw error;
    }
  },

  /**
   * Deactivate a course for the user
   * @param {string} courseId - Course ID to deactivate
   * @returns {Promise<Object>} Deactivation response
   */
  async deactivateCourse(courseId) {
    try {
      const response = await api.post('/users/courses/deactivate', {
        course_id: courseId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to deactivate course:', error);
      throw error;
    }
  }
};

export default courseActivationAPI;
