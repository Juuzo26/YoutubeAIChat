import React from 'react';
import { useVideoChat } from './hooks/useVideoChat';
import { useChat } from './hooks/useChat';
import AuthPanel from './components/AuthPanel';
import ConnectionStatus from './components/ConnectionStatus';
import VideoInput from './components/VideoInput';
import ProcessingIndicator from './components/ProcessingIndicator';
import TranscriptPanel from './components/TranscriptPanel';
import ChatPanel from './components/ChatPanel';

export default function App() {
  // Custom hooks for state management
  const videoState = useVideoChat();
  const chatState = useChat(
    videoState.backendUrl, 
    videoState.transcript, 
    videoState.videoName
  );

  // Handler to process video and initialize chat
  const handleProcessVideo = async () => {
    try {
      const data = await videoState.processVideo();
      chatState.initializeChat(data.video_name);
    } catch (err) {
      // Error already handled in useVideoChat hook
      console.error('Video processing failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 px-4">
            Video to Chat AI
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Analyze and discuss video content with persistent memory
          </p>
        </header>

        {/* Authentication Section */}
        {videoState.showUrlInput ? (
          <AuthPanel
            backendUrl={videoState.backendUrl}
            setBackendUrl={videoState.setBackendUrl}
            sessionCookie={videoState.sessionCookie}
            setSessionCookie={videoState.setSessionCookie}
            onConnect={() => videoState.setShowUrlInput(false)}
          />
        ) : (
          <ConnectionStatus
            backendUrl={videoState.backendUrl}
            onEdit={() => videoState.setShowUrlInput(true)}
          />
        )}

        {/* Video Input Stage - Only show when authenticated and idle */}
        {!videoState.showUrlInput && videoState.stage === 'idle' && (
          <VideoInput
            videoUrl={videoState.videoUrl}
            setVideoUrl={videoState.setVideoUrl}
            loading={videoState.loading}
            error={videoState.error}
            onProcess={handleProcessVideo}
          />
        )}

        {/* Processing Stage - Show loading indicator */}
        {videoState.stage === 'processing' && <ProcessingIndicator />}

        {/* Chat & Transcript Stage - Main interface */}
        {videoState.stage === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in zoom-in duration-300">
            {/* Transcript Panel - Left side on desktop, below chat on mobile */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <TranscriptPanel
                videoName={videoState.videoName}
                transcript={videoState.transcript}
              />
            </div>

            {/* Chat Panel - Right side on desktop, top on mobile */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <ChatPanel
                messages={chatState.messages}
                inputMessage={chatState.inputMessage}
                setInputMessage={chatState.setInputMessage}
                chatLoading={chatState.chatLoading}
                messagesEndRef={chatState.messagesEndRef}
                onSendMessage={chatState.sendMessage}
                onClearChat={chatState.clearChat}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}