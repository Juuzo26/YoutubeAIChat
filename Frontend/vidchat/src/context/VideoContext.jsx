import React, { createContext, useContext, useReducer } from 'react';
import { processVideo } from '../services/api';

// Cache configuration
const CACHE_KEY = 'yt_ai_chat_history';
const MAX_HISTORY = 5;

// Action types
const ACTIONS = {
  SET_BACKEND_URL: 'SET_BACKEND_URL',
  SET_SESSION_COOKIE: 'SET_SESSION_COOKIE',
  TOGGLE_URL_INPUT: 'TOGGLE_URL_INPUT',
  SET_VIDEO_URL: 'SET_VIDEO_URL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_STAGE: 'SET_STAGE',
  SET_VIDEO_DATA: 'SET_VIDEO_DATA',
  RESET_VIDEO: 'RESET_VIDEO',
};

// Initial state
const initialState = {
  // Authentication
  backendUrl: import.meta.env.VITE_BACKEND_URL || '',
  sessionCookie: import.meta.env.VITE_BACKEND_COOKIE || '',
  showUrlInput: false,
  
  // Video processing
  videoUrl: '',
  transcript: '',
  videoName: '',
  
  // UI state
  loading: false,
  error: null,
  stage: 'idle', // idle, processing, ready
};

// Reducer function
const videoReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_BACKEND_URL:
      return { ...state, backendUrl: action.payload };
    
    case ACTIONS.SET_SESSION_COOKIE:
      return { ...state, sessionCookie: action.payload };
    
    case ACTIONS.TOGGLE_URL_INPUT:
      return { ...state, showUrlInput: action.payload };
    
    case ACTIONS.SET_VIDEO_URL:
      return { ...state, videoUrl: action.payload };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ACTIONS.SET_STAGE:
      return { ...state, stage: action.payload };
    
    case ACTIONS.SET_VIDEO_DATA:
      return {
        ...state,
        videoName: action.payload.videoName,
        transcript: action.payload.transcript,
        stage: 'ready',
        loading: false,
        error: null,
      };
    
    case ACTIONS.RESET_VIDEO:
      return {
        ...state,
        videoUrl: '',
        transcript: '',
        videoName: '',
        error: null,
        stage: 'idle',
        loading: false,
      };
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

// Create context
const VideoContext = createContext(null);

// Custom hook
export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};

// Provider component
export const VideoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  /**
   * Save result to LocalStorage
   */
  const saveToCache = (url, name, text) => {
    try {
      let history = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      history = history.filter(item => item.url !== url);
      history.unshift({ 
        url, 
        videoName: name, 
        transcript: text, 
        date: new Date().toISOString() 
      });
      
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save to cache:", e);
    }
  };

  /**
   * Get result from LocalStorage
   */
  const getFromCache = (url) => {
    const history = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return history.find(item => item.url === url);
  };

  /**
   * Action creators (helper functions)
   */
  const setBackendUrl = (url) => {
    dispatch({ type: ACTIONS.SET_BACKEND_URL, payload: url });
  };

  const setSessionCookie = (cookie) => {
    dispatch({ type: ACTIONS.SET_SESSION_COOKIE, payload: cookie });
  };

  const setShowUrlInput = (show) => {
    dispatch({ type: ACTIONS.TOGGLE_URL_INPUT, payload: show });
  };

  const setVideoUrl = (url) => {
    dispatch({ type: ACTIONS.SET_VIDEO_URL, payload: url });
  };

  /**
   * Process video
   */
  const handleProcessVideo = async () => {
    if (!state.videoUrl.trim()) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please enter a video URL' });
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });

    // Check cache first
    const cached = getFromCache(state.videoUrl);
    if (cached) {
      console.log("🚀 Cache hit! Loading persistent transcript.");
      dispatch({ 
        type: ACTIONS.SET_VIDEO_DATA, 
        payload: { 
          videoName: cached.videoName, 
          transcript: cached.transcript 
        }
      });
      return cached;
    }

    // Call backend
    dispatch({ type: ACTIONS.SET_STAGE, payload: 'processing' });
    try {
      const data = await processVideo(state.backendUrl, state.videoUrl);
      
      dispatch({ 
        type: ACTIONS.SET_VIDEO_DATA, 
        payload: { 
          videoName: data.video_name, 
          transcript: data.transcript 
        }
      });
      
      saveToCache(state.videoUrl, data.video_name, data.transcript);
      return data;
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      dispatch({ type: ACTIONS.SET_STAGE, payload: 'idle' });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      throw err;
    }
  };

  /**
   * Reset video state
   */
  const resetVideo = () => {
    dispatch({ type: ACTIONS.RESET_VIDEO });
  };

  const value = {
    // State
    ...state,
    
    // Actions
    setBackendUrl,
    setSessionCookie,
    setShowUrlInput,
    setVideoUrl,
    processVideo: handleProcessVideo,
    resetVideo,
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

// Export action types for testing
export { ACTIONS };