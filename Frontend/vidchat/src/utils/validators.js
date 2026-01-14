/**
 * Validators Utility
 * Centralized validation functions for forms and inputs
 */

/**
 * YouTube URL validation patterns
 */
const YOUTUBE_REGEX = {
  STANDARD: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?$/,
  SHORT: /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
  EMBED: /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
  SHORTS: /^https?:\/\/(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
};

/**
 * Validate YouTube URL
 * 
 * @param {string} url - URL to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required',
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return {
      isValid: false,
      error: 'URL cannot be empty',
    };
  }

  const isValid = Object.values(YOUTUBE_REGEX).some(regex => regex.test(trimmedUrl));

  if (!isValid) {
    return {
      isValid: false,
      error: 'Please enter a valid YouTube URL (youtube.com/watch, youtu.be, or youtube.com/shorts)',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate backend URL (Ngrok or any HTTP/HTTPS URL)
 * 
 * @param {string} url - Backend URL to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateBackendUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'Backend URL is required',
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return {
      isValid: false,
      error: 'Backend URL cannot be empty',
    };
  }

  try {
    const parsed = new URL(trimmedUrl);
    
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'URL must start with http:// or https://',
      };
    }

    // Check if it looks like an ngrok URL (optional, can be any URL)
    const isNgrok = parsed.hostname.includes('ngrok');
    
    if (isNgrok && !parsed.hostname.endsWith('.ngrok-free.app') && !parsed.hostname.endsWith('.ngrok.io')) {
      return {
        isValid: false,
        error: 'Ngrok URL should end with .ngrok-free.app or .ngrok.io',
      };
    }

    return {
      isValid: true,
      error: null,
    };
  } catch (err) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
};

/**
 * Validate session cookie (basic check for non-empty string)
 * 
 * @param {string} cookie - Session cookie value
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateSessionCookie = (cookie) => {
  if (!cookie || typeof cookie !== 'string') {
    return {
      isValid: false,
      error: 'Session cookie is required',
    };
  }

  const trimmedCookie = cookie.trim();

  if (trimmedCookie.length === 0) {
    return {
      isValid: false,
      error: 'Session cookie cannot be empty',
    };
  }

  if (trimmedCookie.length < 10) {
    return {
      isValid: false,
      error: 'Session cookie appears to be too short',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate chat message input
 * 
 * @param {string} message - Message to validate
 * @param {number} maxLength - Maximum message length (default: 2000)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateChatMessage = (message, maxLength = 2000) => {
  if (!message || typeof message !== 'string') {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  if (trimmedMessage.length > maxLength) {
    return {
      isValid: false,
      error: `Message is too long (max ${maxLength} characters)`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate authentication form (backend URL + session cookie)
 * 
 * @param {string} backendUrl - Backend URL
 * @param {string} sessionCookie - Session cookie
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateAuthForm = (backendUrl, sessionCookie) => {
  const urlValidation = validateBackendUrl(backendUrl);
  const cookieValidation = validateSessionCookie(sessionCookie);

  return {
    isValid: urlValidation.isValid && cookieValidation.isValid,
    errors: {
      backendUrl: urlValidation.error,
      sessionCookie: cookieValidation.error,
    },
  };
};

/**
 * Sanitize user input (remove potentially dangerous characters)
 * 
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Check if transcript is valid
 * 
 * @param {string} transcript - Transcript text
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateTranscript = (transcript) => {
  if (!transcript || typeof transcript !== 'string') {
    return {
      isValid: false,
      error: 'Transcript is missing',
    };
  }

  const trimmed = transcript.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Transcript is empty',
    };
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: 'Transcript is too short',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate file size (for potential file upload features)
 * 
 * @param {number} sizeInBytes - File size in bytes
 * @param {number} maxSizeInMB - Maximum allowed size in MB (default: 10)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateFileSize = (sizeInBytes, maxSizeInMB = 10) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (sizeInBytes > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File is too large (max ${maxSizeInMB}MB)`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Check if string contains only alphanumeric and safe characters
 * 
 * @param {string} str - String to check
 * @returns {boolean} True if safe
 */
export const isSafeString = (str) => {
  if (!str || typeof str !== 'string') return false;
  // Allow letters, numbers, spaces, and common punctuation
  const safePattern = /^[a-zA-Z0-9\s.,!?'"-]+$/;
  return safePattern.test(str);
};

/**
 * Extract and validate video ID from YouTube URL
 * 
 * @param {string} url - YouTube URL
 * @returns {Object} { videoId: string|null, isValid: boolean }
 */
export const extractAndValidateVideoId = (url) => {
  const validation = validateYouTubeUrl(url);
  
  if (!validation.isValid) {
    return {
      videoId: null,
      isValid: false,
    };
  }

  for (const [key, regex] of Object.entries(YOUTUBE_REGEX)) {
    const match = url.match(regex);
    if (match && match[2]) {
      return {
        videoId: match[2],
        isValid: true,
      };
    }
  }

  return {
    videoId: null,
    isValid: false,
  };
};

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  REQUIRED: 'This field is required',
  INVALID_URL: 'Invalid URL format',
  INVALID_YOUTUBE_URL: 'Please enter a valid YouTube URL',
  INVALID_BACKEND_URL: 'Please enter a valid backend URL',
  EMPTY_MESSAGE: 'Message cannot be empty',
  TOO_LONG: 'Input is too long',
  TOO_SHORT: 'Input is too short',
  INVALID_FORMAT: 'Invalid format',
};

/**
 * Debounce validator for real-time validation
 * 
 * @param {Function} validator - Validator function
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} Debounced validator
 */
export const createDebouncedValidator = (validator, delay = 300) => {
  let timeoutId;

  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = validator(...args);
        resolve(result);
      }, delay);
    });
  };
};