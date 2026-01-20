import { useState } from 'react';
import { processVideo } from '../services/api';

// Cache configuration constants
const CACHE_KEY = 'yt_ai_chat_history';
const MAX_HISTORY = 5;

export function useVideoChat() {
  // Authentication state
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_BACKEND_URL || '');
  const [sessionCookie, setSessionCookie] = useState(import.meta.env.VITE_BACKEND_COOKIE || '');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Video processing state
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoName, setVideoName] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('idle'); // idle, processing, ready

  /**
   * Helper: Save result to LocalStorage with a 5-item limit
   */
  const saveToCache = (url, name, text) => {
    try {
      let history = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      
      // Remove existing entry for this URL to move it to the top (LRU)
      history = history.filter(item => item.url !== url);
      
      // Add new entry to the front
      history.unshift({ url, videoName: name, transcript: text, date: new Date().toISOString() });
      
      // Enforce the 5-instance limit
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save to cache:", e);
    }
  };

  /**
   * Helper: Get result from LocalStorage
   */
  const getFromCache = (url) => {
    const history = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return history.find(item => item.url === url);
  };

  /**
   * Process video: checks cache first, then calls backend
   */
  const handleProcessVideo = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setLoading(true);
    setError(null);

    // --- STEP 1: CHECK CACHE ---
    const cached = getFromCache(videoUrl);
    if (cached) {
      console.log("🚀 Cache hit! Loading persistent transcript.");
      setVideoName(cached.videoName);
      setTranscript(cached.transcript);
      setStage('ready');
      setLoading(false);
      return cached;
    }

    // --- STEP 2: CALL BACKEND ---
    setStage('processing');
    try {
      const data = await processVideo(backendUrl, videoUrl);

      // Update UI state
      setVideoName(data.video_name);
      setTranscript(data.transcript);
      setStage('ready');

      // --- STEP 3: PERSIST TO CACHE ---
      saveToCache(videoUrl, data.video_name, data.transcript);

      return data;
    } catch (err) {
      setError(err.message);
      setStage('idle');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetVideo = () => {
    setVideoUrl('');
    setTranscript('');
    setVideoName('');
    setError(null);
    setStage('idle');
  };

  return {
    backendUrl, setBackendUrl,
    sessionCookie, setSessionCookie,
    showUrlInput, setShowUrlInput,
    videoUrl, setVideoUrl,
    transcript, videoName,
    loading, error, stage,
    processVideo: handleProcessVideo,
    resetVideo,
  };
}