/**
 * API Service Layer
 * Handles all backend communication for video processing and chat
 */

/**
 * Clean URL by removing trailing slashes
 * @param {string} url - Backend URL
 * @returns {string} Cleaned URL
 */
const cleanUrl = (url) => url.replace(/\/+$/, '');

/**
 * Generic error handler for fetch responses
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} If response is not OK
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: 'Server error' 
    }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Process a YouTube video: download and transcribe
 * 
 * @param {string} backendUrl - Backend API base URL
 * @param {string} videoUrl - YouTube video URL
 * @returns {Promise<Object>} { video_name: string, transcript: string }
 * @throws {Error} If processing fails
 */
export const processVideo = async (backendUrl, videoUrl) => {
  const url = `${cleanUrl(backendUrl)}/process_full_video`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    });

    return await handleResponse(response);
  } catch (err) {
    console.error('Process video error:', err);
    throw new Error(err.message || 'Failed to process video');
  }
};

/**
 * Send a chat message with context (transcript + history + reply_style)
 * 
 * @param {string} backendUrl - Backend API base URL
 * @param {Object} payload - Chat payload
 * @param {string} payload.message - User's message
 * @param {string} payload.transcript - Full video transcript
 * @param {string} payload.videoName - Video name for context
 * @param {Array} payload.history - Previous chat messages
 * @param {string} payload.reply_style - AI reply persona/style
 * @returns {Promise<Object>} { response: string }
 * @throws {Error} If chat request fails
 */
export const sendChatMessage = async (backendUrl, payload) => {
  const url = `${cleanUrl(backendUrl)}/chat`;
  
  const { message, transcript, videoName, history, reply_style } = payload;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        transcript,
        video_name: videoName,
        history: history || [],
        reply_style: reply_style || 'Helpful and concise', // ✅ NOW INCLUDED!
      }),
    });

    return await handleResponse(response);
  } catch (err) {
    console.error('Chat message error:', err);
    throw new Error(err.message || 'Failed to send message');
  }
};

/**
 * Test backend connection
 * Optional: Use this to verify backend is reachable
 * 
 * @param {string} backendUrl - Backend API base URL
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const testConnection = async (backendUrl) => {
  const url = `${cleanUrl(backendUrl)}/health`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
};

/**
 * Configuration object for API settings
 */
export const API_CONFIG = {
  TIMEOUT: 300000, // 5 minutes for video processing
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * API endpoints
 */
export const ENDPOINTS = {
  PROCESS_VIDEO: '/process_full_video',
  CHAT: '/chat',
  HEALTH: '/health',
};