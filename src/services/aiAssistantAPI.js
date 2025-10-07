import axiosInstance from '../utils/axios';

/**
 * AI Assistant API Service
 * Handles communication with the AI Agent backend endpoints
 * 
 * NOTE: All AI operations (hint generation, chat) use a 120-second timeout by default
 * to accommodate LLM processing time. This can be overridden by passing a custom timeout parameter.
 */

/**
 * Request an adaptive pedagogical hint (uses full ITS orchestrator)
 * @param {string} questionId - The question/problem ID
 * @param {string} code - Current user code
 * @param {number} hintLevel - Hint level (1-5) - auto-calculated by backend
 * @param {string} sessionId - Optional session ID
 * @param {number} timeout - Request timeout in ms (default: 120000 = 2 minutes)
 * @returns {Promise} - Hint response with adaptive content
 */
export const requestOrchestratedHint = async (questionId, code, hintLevel, sessionId = null, timeout = 120000) => {
  try {
    const payload = {
      question_id: questionId,
      code: code || '',
      hint_level: hintLevel,
      session_id: sessionId
    };

    console.log('🔍 DEBUG - Requesting orchestrated hint:', {
      questionId,
      codeLength: code ? code.length : 0,
      hintLevel,
      sessionId: sessionId || 'NO SESSION ID',
      timeout: `${timeout / 1000}s`
    });

    const response = await axiosInstance.post('/agents/hint', payload, { timeout });
    
    console.log('🔍 DEBUG - Backend response:', {
      hint_text_length: response.data.hint_text?.length || 0,
      hint_level: response.data.hint_level,
      level_name: response.data.level_name,
      hints_used_total: response.data.hints_used_total,
      hints_remaining: response.data.hints_remaining,
      full_data: response.data
    });
    
    return {
      success: true,
      hint: response.data.hint_text,
      hint_level: response.data.hint_level,
      level_name: response.data.level_name,
      hints_used: response.data.hints_used_total,
      hints_remaining: response.data.hints_remaining || 0
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
 * @param {number} timeout - Request timeout in ms (default: 120000 = 2 minutes)
 * @returns {Promise} - Hint response
 */
export const requestSimpleHint = async (questionId, code, hintLevel, sessionId = null, timeout = 120000) => {
  try {
    const payload = {
      question_id: questionId,
      code: code || '',
      hint_level: hintLevel,
      session_id: sessionId
    };

    const response = await axiosInstance.post('/agents/hint', payload, { timeout });
    
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
 * @param {string} sessionId - Current session ID
 * @param {Array} conversationHistory - Previous messages
 * @param {number} timeout - Request timeout in ms (default: 120000 = 2 minutes)
 * @returns {Promise} - AI response
 */
export const sendChatMessage = async (message, questionId, code, sessionId, conversationHistory = [], timeout = 120000) => {
  try {
    const payload = {
      message,
      question_id: questionId,
      code: code || '',
      session_id: sessionId,
      history: conversationHistory
    };

    const response = await axiosInstance.post('/agents/chat', payload, { timeout });
    
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
 * Get chat history for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise} - Chat history
 */
export const getChatHistory = async (sessionId) => {
  try {
    const response = await axiosInstance.get(`/agents/chat/history/${sessionId}`);
    return {
      success: true,
      messages: response.data.messages || [],
      total: response.data.total || 0
    };
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return {
      success: false,
      messages: [],
      error: 'Failed to load chat history'
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
  getChatHistory,
  checkAgentHealth
};

