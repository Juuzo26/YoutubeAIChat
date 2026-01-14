/**
 * Video Service
 * Utilities for video URL validation and metadata extraction
 */

/**
 * YouTube URL patterns
 */
const YOUTUBE_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
];

/**
 * Validate if a URL is a valid YouTube URL
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return YOUTUBE_PATTERNS.some(pattern => pattern.test(url.trim()));
};

/**
 * Extract YouTube video ID from URL
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if not found
 */
export const extractVideoId = (url) => {
  if (!url) return null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[2]) {
      return match[2];
    }
  }

  return null;
};

/**
 * Generate YouTube thumbnail URL from video ID
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string|null} Thumbnail URL or null
 */
export const getThumbnailUrl = (videoId, quality = 'hqdefault') => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Generate YouTube embed URL from video ID
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {string|null} Embed URL or null
 */
export const getEmbedUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Normalize YouTube URL to standard watch format
 * 
 * @param {string} url - YouTube URL in any format
 * @returns {string|null} Normalized URL or null
 */
export const normalizeYouTubeUrl = (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Validate backend URL format
 * 
 * @param {string} url - Backend URL
 * @returns {boolean} True if valid URL format
 */
export const isValidBackendUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Estimate video processing time based on URL
 * Note: This is a rough estimate, actual time depends on video length and server load
 * 
 * @param {string} url - YouTube URL
 * @returns {string} Estimated processing time message
 */
export const estimateProcessingTime = (url) => {
  // Since we can't determine video length client-side without API call,
  // return a general estimate
  return 'Processing typically takes 30-60 seconds per 5 minutes of video';
};

/**
 * Format transcript for display
 * 
 * @param {string} transcript - Raw transcript text
 * @returns {string} Formatted transcript
 */
export const formatTranscript = (transcript) => {
  if (!transcript) return '';
  
  // Basic formatting: ensure proper spacing
  return transcript
    .trim()
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/\s+/g, ' '); // Normalize spaces
};

/**
 * Calculate transcript statistics
 * 
 * @param {string} transcript - Transcript text
 * @returns {Object} Statistics object
 */
export const getTranscriptStats = (transcript) => {
  if (!transcript) {
    return {
      words: 0,
      characters: 0,
      lines: 0,
      estimatedReadingTime: 0,
    };
  }

  const words = transcript.split(/\s+/).filter(Boolean).length;
  const characters = transcript.length;
  const lines = transcript.split('\n').length;
  const estimatedReadingTime = Math.ceil(words / 200); // 200 words per minute

  return {
    words,
    characters,
    lines,
    estimatedReadingTime,
  };
};

/**
 * Search for a term in transcript
 * 
 * @param {string} transcript - Full transcript
 * @param {string} searchTerm - Term to search for
 * @returns {Array<Object>} Array of matches with context
 */
export const searchTranscript = (transcript, searchTerm) => {
  if (!transcript || !searchTerm) return [];

  const regex = new RegExp(searchTerm, 'gi');
  const matches = [];
  let match;

  while ((match = regex.exec(transcript)) !== null) {
    const start = Math.max(0, match.index - 50);
    const end = Math.min(transcript.length, match.index + searchTerm.length + 50);
    const context = transcript.substring(start, end);

    matches.push({
      position: match.index,
      context: `...${context}...`,
      match: match[0],
    });
  }

  return matches;
};

/**
 * Video processing error messages
 */
export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid YouTube URL',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT: 'Request timed out. Video might be too long',
  UNKNOWN: 'An unexpected error occurred',
};

/**
 * Get user-friendly error message
 * 
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.UNKNOWN;

  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  if (message.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }
  if (message.includes('server') || message.includes('500')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  if (message.includes('invalid') || message.includes('url')) {
    return ERROR_MESSAGES.INVALID_URL;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN;
};