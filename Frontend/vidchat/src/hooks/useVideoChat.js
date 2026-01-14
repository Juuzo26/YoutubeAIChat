import { useState } from 'react';
import { processVideo } from '../services/api';

/**
 * Custom hook for managing video processing state
 * Handles authentication, video URL input, and transcription
 */
export function useVideoChat() {
  // Authentication state
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_BACKEND_URL || '');
  const [sessionCookie, setSessionCookie] = useState(import.meta.env.VITE_BACKEND_COOKIE || '');
  const [showUrlInput, setShowUrlInput] = useState(false); // Change true to false

  // Video processing state
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoName, setVideoName] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('idle'); // idle, processing, ready

  /**
   * Process video: download and transcribe
   * @returns {Promise<Object>} Video data with transcript and name
   * @throws {Error} If processing fails
   */
  const handleProcessVideo = async () => {
    // Validation
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    // Reset error and start processing
    setLoading(true);
    setError(null);
    setStage('processing');

    try {
      // Call API service
      const data = await processVideo(backendUrl, videoUrl);

      // Update state with results
      setVideoName(data.video_name);
      setTranscript(data.transcript);
      setStage('ready');

      return data;
    } catch (err) {
      // Handle errors
      setError(err.message);
      setStage('idle');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset video processing state
   */
  const resetVideo = () => {
    setVideoUrl('');
    setTranscript('');
    setVideoName('');
    setError(null);
    setStage('idle');
  };

  return {
    // Authentication
    backendUrl,
    setBackendUrl,
    sessionCookie,
    setSessionCookie,
    showUrlInput,
    setShowUrlInput,

    // Video processing
    videoUrl,
    setVideoUrl,
    transcript,
    videoName,

    // UI state
    loading,
    error,
    stage,

    // Actions
    processVideo: handleProcessVideo,
    resetVideo,
  };
}