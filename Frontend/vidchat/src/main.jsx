import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { VideoProvider } from './context/VideoContext';
import { ChatProvider } from './context/ChatContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VideoProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </VideoProvider>
  </React.StrictMode>
);