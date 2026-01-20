import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

/**
 * Custom hook for managing chat functionality
 * Handles message state, sending, auto-scrolling, and LocalStorage persistence
 */
export function useChat(backendUrl, transcript, videoName) {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  /**
   * PERSISTENCE LOGIC: Load chat history from LocalStorage when videoName changes
   */
  useEffect(() => {
    if (videoName) {
      const savedChat = localStorage.getItem(`chat_history_${videoName}`);
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      }
    }
  }, [videoName]);

  /**
   * PERSISTENCE LOGIC: Save chat history to LocalStorage whenever messages change
   */
  useEffect(() => {
    if (videoName && messages.length > 0) {
      localStorage.setItem(`chat_history_${videoName}`, JSON.stringify(messages));
    }
  }, [messages, videoName]);

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
   * Fixed: Added fallback to prevent "undefined" when loading from cache
   */
  const initializeChat = (name) => {
    // If messages already exist for this video (loaded from LocalStorage), don't overwrite them
    if (messages.length > 0) return;

    const displayName = name || videoName || "Video";
    
    setMessages([{
      role: 'system',
      content: `"${displayName}" has been processed. You can now chat about it!`,
      timestamp: new Date().toISOString(),
    }]);
  };

  /**
   * Send a chat message to the backend
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatLoading) return;
    
    const userMessage = inputMessage.trim();
    const currentHistory = [...messages];
    
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    
    setInputMessage('');
    setMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);

    try {
      const data = await sendChatMessage(backendUrl, {
        message: userMessage,
        transcript,
        videoName,
        history: currentHistory,
      });
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
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
    const clearedMessages = [{
      role: 'system',
      content: `Memory cleared. You can still chat about "${videoName}".`,
      timestamp: new Date().toISOString(),
    }];
    setMessages(clearedMessages);
    // Also clear the specific LocalStorage for this video
    localStorage.removeItem(`chat_history_${videoName}`);
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
    messages,
    inputMessage,
    setInputMessage,
    chatLoading,
    messagesEndRef,
    sendMessage: handleSendMessage,
    clearChat,
    initializeChat,
    resetChat,
  };
}