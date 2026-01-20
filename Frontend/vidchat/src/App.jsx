import React, { useEffect, useRef } from 'react';
import { useVideoContext } from './context/VideoContext';
import { useChatContext } from './context/ChatContext';

// Components
import SettingsModal from './components/SettingsModal';
import VideoInput from './components/VideoInput';
import ProcessingIndicator from './components/ProcessingIndicator';
import TranscriptPanel from './components/TranscriptPanel';
import ChatPanel from './components/ChatPanel';

export default function App() {
  const mainContentRef = useRef(null);
  
  // Get state and actions from contexts
  const {
    backendUrl,
    setBackendUrl,
    sessionCookie,
    setSessionCookie,
    videoUrl,
    setVideoUrl,
    transcript,
    videoName,
    loading,
    error,
    stage,
    processVideo,
  } = useVideoContext();

  const {
    messages,
    inputMessage,
    setInputMessage,
    chatLoading,
    messagesEndRef,
    sendMessage,
    clearChat,
    initializeChat,
    replyStyle,        
    setReplyStyle,     
  } = useChatContext();

  useEffect(() => {
    if (stage === 'ready' && videoName) {
      initializeChat(videoName);
    }
  }, [stage, videoName]);

  // Check if authenticated
  const isAuthenticated = backendUrl && sessionCookie;

  // Handle connection from settings
  const handleConnect = () => {
    // Connection logic handled in context
    console.log('Connected to backend');
  };

  // Skip link handler
  const handleSkipToMain = (e) => {
    e.preventDefault();
    mainContentRef.current?.focus();
  };

  return (
    <>
      {/* Skip Link - Accessibility Feature */}
      <a
        href="#main-content"
        onClick={handleSkipToMain}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg transition-all"
      >
        Skip to main content
      </a>

      {/* Settings Button (Top Right - Hidden Auth) */}
      <SettingsModal
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        sessionCookie={sessionCookie}
        setSessionCookie={setSessionCookie}
        onConnect={handleConnect}
        isAuthenticated={isAuthenticated}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🎥 VidChat
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Transform YouTube videos into interactive chat experiences
            </p>
          </header>

          {/* Main Content Area */}
          <main 
            id="main-content" 
            ref={mainContentRef}
            tabIndex={-1}
            className="outline-none"
            aria-label="Main content"
          >
            {/* Authentication Required Message (only if not authenticated) */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-6 text-center">
                <p className="text-amber-800 text-sm sm:text-base">
                  ⚙️ Please configure backend connection in{' '}
                  <span className="font-semibold">Settings</span> (top-right corner)
                </p>
              </div>
            )}

            {/* Main Content (only if authenticated) */}
            {isAuthenticated && (
              <>
                {/* Video Input (idle stage) */}
                {stage === 'idle' && (
                  <section aria-labelledby="video-input-heading">
                    <h2 id="video-input-heading" className="sr-only">
                      Video Input
                    </h2>
                    <VideoInput
                      videoUrl={videoUrl}
                      setVideoUrl={setVideoUrl}
                      loading={loading}
                      error={error}
                      onProcess={processVideo}
                    />
                  </section>
                )}

                {/* Processing Indicator */}
                {stage === 'processing' && (
                  <section 
                    aria-live="polite" 
                    aria-label="Processing video"
                  >
                    <ProcessingIndicator />
                  </section>
                )}

                {/* Transcript + Chat (ready stage) */}
                {stage === 'ready' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Transcript Panel */}
                    <section aria-labelledby="transcript-heading">
                      <h2 id="transcript-heading" className="sr-only">
                        Video Transcript
                      </h2>
                      <TranscriptPanel
                        videoName={videoName}
                        transcript={transcript}
                      />
                    </section>

                    {/* Chat Panel */}
                    <section aria-labelledby="chat-heading">
                      <h2 id="chat-heading" className="sr-only">
                        Chat Interface
                      </h2>
                      <ChatPanel
                        messages={messages}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        chatLoading={chatLoading}
                        messagesEndRef={messagesEndRef}
                        onSendMessage={sendMessage}
                        onClearChat={clearChat}
                        replyStyle={replyStyle}         // ✅ PASS THIS
                        setReplyStyle={setReplyStyle}   // ✅ PASS THIS
                      />
                    </section>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Footer */}
          <footer className="text-center mt-8 sm:mt-12 text-xs sm:text-sm text-gray-500">
            <p>
              Powered by{' '}
              <span className="font-semibold text-indigo-600">OpenAI Whisper</span>
              {' '}& <span className="font-semibold text-purple-600">Claude AI</span>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}