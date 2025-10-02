import axiosInstance from '../utils/axios';

/**
 * AI Assistant API Service
 * Handles communication with the AI Agent backend endpoints
 */

/**
 * Request an adaptive pedagogical hint from the orchestrator
 * @param {string} questionId - The question/problem ID
 * @param {string} code - Current user code
 * @param {number} hintLevel - Hint level (1-5)
 * @param {string} sessionId - Optional session ID
 * @returns {Promise} - Hint response with adaptive content
 */
export const requestOrchestrated

Hint = async (questionId, code, hintLevel, sessionId = null) => {
  try {
    const payload = {
      question_id: questionId,
      code: code || '',
      hint_level: hintLevel,
      session_id: sessionId
    };

    const response = await axiosInstance.post('/agents/hint-orchestrated', payload);
    
    return {
      success: true,
      hint: response.data.hint_text,
      level: response.data.hint_level,
      levelName: response.data.level_name,
      hintsUsed: response.data.hints_used_total
    };
  } catch (error) {
    console.error('Failed to request orchestrated hint:', error);
    
    // Return user-friendly error message
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'Failed to generate hint. Please try again.';
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Request a standalone hint (faster, no proficiency calculation)
 * @param {string} questionId - The question/problem ID
 * @param {string} code - Current user code
 * @param {number} hintLevel - Hint level (1-5)
 * @param {string} sessionId - Optional session ID
 * @returns {Promise} - Hint response
 */
export const requestSimpleHint = async (questionId, code, hintLevel, sessionId = null) => {
  try {
    const payload = {
      question_id: questionId,
      code: code || '',
      hint_level: hintLevel,
      session_id: sessionId
    };

    const response = await axiosInstance.post('/agents/hint', payload);
    
    return {
      success: true,
      hint: response.data.hint_text,
      level: response.data.hint_level,
      levelName: response.data.level_name,
      hintsUsed: response.data.hints_used_total
    };
  } catch (error) {
    console.error('Failed to request simple hint:', error);
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'Failed to generate hint. Please try again.';
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Send a chat message to the AI assistant
 * @param {string} message - User's message
 * @param {string} questionId - Current question ID
 * @param {string} code - Current code
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise} - AI response
 */
export const sendChatMessage = async (message, questionId, code, conversationHistory = []) => {
  try {
    const payload = {
      message,
      question_id: questionId,
      code: code || '',
      history: conversationHistory
    };

    const response = await axiosInstance.post('/agents/chat', payload);
    
    return {
      success: true,
      message: response.data.message,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('Failed to send chat message:', error);
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'Failed to send message. Please try again.';
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Check AI agent health status
 * @returns {Promise} - Health status
 */
export const checkAgentHealth = async () => {
  try {
    const response = await axiosInstance.get('/agents/health');
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Failed to check agent health:', error);
    return {
      success: false,
      error: 'Failed to check agent status'
    };
  }
};

export default {
  requestOrchestratedHint,
  requestSimpleHint,
  sendChatMessage,
  checkAgentHealth
};

