import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

/**
 * Custom hook for managing chat functionality
 * Handles message state, sending, and auto-scrolling
 * 
 * @param {string} backendUrl - Backend API URL
 * @param {string} transcript - Video transcript for context
 * @param {string} videoName - Name of the video being discussed
 */
export function useChat(backendUrl, transcript, videoName) {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Auto-scroll when messages change
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Initialize chat with system message
   * Called after video is processed
   * 
   * @param {string} name - Video name to display
   */
  const initializeChat = (name) => {
    setMessages([{
      role: 'system',
      content: `"${name}" has been processed. You can now chat about it!`,
      timestamp: new Date().toISOString(),
    }]);
  };

  /**
   * Send a chat message to the backend
   * Maintains conversation history for context
   */
  const handleSendMessage = async () => {
    // Validation
    if (!inputMessage.trim() || chatLoading) return;
    
    const userMessage = inputMessage.trim();
    
    // Capture current history BEFORE updating state
    // This ensures backend receives the history without the new user message
    const currentHistory = [...messages];
    
    // Optimistically add user message to UI
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    
    setInputMessage('');
    setMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);

    try {
      // Call API with conversation context
      const data = await sendChatMessage(backendUrl, {
        message: userMessage,
        transcript,
        videoName,
        history: currentHistory,
      });
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'Chat Error. Please check your backend connection.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  /**
   * Clear chat history but keep system message
   */
  const clearChat = () => {
    setMessages([{
      role: 'system',
      content: `Memory cleared. You can still chat about "${videoName}".`,
      timestamp: new Date().toISOString(),
    }]);
  };

  /**
   * Completely reset chat state
   */
  const resetChat = () => {
    setMessages([]);
    setInputMessage('');
    setChatLoading(false);
  };

  return {
    // State
    messages,
    inputMessage,
    setInputMessage,
    chatLoading,
    messagesEndRef,

    // Actions
    sendMessage: handleSendMessage,
    clearChat,
    initializeChat,
    resetChat,
  };
}