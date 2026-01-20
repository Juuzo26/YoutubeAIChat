import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { useVideoContext } from './VideoContext';

// Action types
const ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_INPUT: 'SET_INPUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_CHAT: 'CLEAR_CHAT',
  RESET_CHAT: 'RESET_CHAT',
  INITIALIZE_CHAT: 'INITIALIZE_CHAT',
  SET_STYLE: 'SET_STYLE',
};

// Initial state
const initialState = {
  messages: [],
  inputMessage: '',
  chatLoading: false,
  replyStyle: 'Helpful and concise',
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    
    case ACTIONS.SET_INPUT:
      return { ...state, inputMessage: action.payload };
    
    case ACTIONS.SET_LOADING:
      return { ...state, chatLoading: action.payload };

    case ACTIONS.SET_STYLE:
      return { ...state, replyStyle: action.payload };
    
    case ACTIONS.CLEAR_CHAT:
      return {
        ...state,
        messages: [{
          role: 'system',
          content: action.payload.message,
          timestamp: new Date().toISOString(),
        }],
      };
    
    case ACTIONS.RESET_CHAT:
      return { ...initialState };
    
    case ACTIONS.INITIALIZE_CHAT:
      if (state.messages.length > 0) return state;
      return {
        ...state,
        messages: [{
          role: 'system',
          content: action.payload.message,
          timestamp: new Date().toISOString(),
        }],
      };
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { backendUrl, transcript, videoName } = useVideoContext();
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  const messagesEndRef = useRef(null);

  /**
   * 1. Load chat history AND active style when videoName changes
   */
  useEffect(() => {
    if (videoName) {
      const savedChat = localStorage.getItem(`chat_history_${videoName}`);
      if (savedChat) {
        dispatch({ 
          type: ACTIONS.SET_MESSAGES, 
          payload: JSON.parse(savedChat) 
        });
      }

      const savedStyle = localStorage.getItem(`chat_style_${videoName}`);
      if (savedStyle) {
        dispatch({ type: ACTIONS.SET_STYLE, payload: savedStyle });
      } else {
        dispatch({ type: ACTIONS.SET_STYLE, payload: 'Helpful and concise' });
      }
    }
  }, [videoName]);

  /**
   * 2. Save chat history AND active style whenever they change
   */
  useEffect(() => {
    if (videoName) {
      if (state.messages.length > 0) {
        localStorage.setItem(`chat_history_${videoName}`, JSON.stringify(state.messages));
      }
      localStorage.setItem(`chat_style_${videoName}`, state.replyStyle);
    }
  }, [state.messages, state.replyStyle, videoName]);

  /**
   * 3. Auto-scroll logic
   */
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  /**
   * Action Methods
   */
  const setInputMessage = (message) => {
    dispatch({ type: ACTIONS.SET_INPUT, payload: message });
  };

  const setReplyStyle = (style) => {
    dispatch({ type: ACTIONS.SET_STYLE, payload: style });
  };

  const initializeChat = (name) => {
    const displayName = name || videoName || "Video";
    dispatch({ 
      type: ACTIONS.INITIALIZE_CHAT, 
      payload: { 
        message: `"${displayName}" has been processed. You can now chat about it!` 
      }
    });
  };

  const handleSendMessage = async () => {
    if (!state.inputMessage.trim() || state.chatLoading) return;

    const userMessage = state.inputMessage.trim();
    const currentHistory = [...state.messages];
    
    dispatch({ 
      type: ACTIONS.ADD_MESSAGE, 
      payload: {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      }
    });
    
    dispatch({ type: ACTIONS.SET_INPUT, payload: '' });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const data = await sendChatMessage(backendUrl, {
        message: userMessage,
        transcript,
        videoName,
        history: currentHistory,
        reply_style: state.replyStyle, 
      });
      
      dispatch({ 
        type: ACTIONS.ADD_MESSAGE, 
        payload: {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (err) {
      dispatch({ 
        type: ACTIONS.ADD_MESSAGE, 
        payload: {
          role: 'assistant',
          content: 'Error: Could not reach the AI. Please check your backend.',
          timestamp: new Date().toISOString(),
        }
      });
      console.error('Chat error:', err);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const clearChat = () => {
    dispatch({ 
      type: ACTIONS.CLEAR_CHAT, 
      payload: { 
        message: `Memory cleared. I'm ready for new questions about "${videoName}".` 
      }
    });
    localStorage.removeItem(`chat_history_${videoName}`);
  };

  const resetChat = () => {
    dispatch({ type: ACTIONS.RESET_CHAT });
  };

  const value = {
    ...state,
    messagesEndRef,
    setInputMessage,
    setReplyStyle,
    onSendMessage: handleSendMessage,
    onClearChat: clearChat,
    initializeChat,
    sendMessage: handleSendMessage, // Change 'onSendMessage' to 'sendMessage'
    resetChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};