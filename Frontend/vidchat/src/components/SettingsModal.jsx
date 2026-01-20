import React, { useState, useRef, useEffect } from 'react';
import { Settings, X, Lock } from 'lucide-react';
import AuthPanel from './AuthPanel';

export default function SettingsModal({ 
  backendUrl, 
  setBackendUrl, 
  sessionCookie, 
  setSessionCookie, 
  onConnect,
  isAuthenticated 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  
  // Ref to track the reset timer across renders
  const resetTimerRef = useRef(null);
  const TARGET_CLICKS = 5;

  const handleSecretClick = () => {
    // 1. Clear any existing timer so it doesn't reset while we are clicking
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // 2. Increment count
    const nextCount = secretClicks + 1;
    
    if (nextCount >= TARGET_CLICKS) {
      // SUCCESS: Unlock the panel
      setShowAuth(true);
      setSecretClicks(0);
    } else {
      // PROGRESS: Update state and set a new 2-second reset timer
      setSecretClicks(nextCount);
      resetTimerRef.current = setTimeout(() => {
        setSecretClicks(0);
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Optional: Keep showAuth true if they are authenticated so they don't have to 
    // click 5 times every single time they open settings.
    if (!isAuthenticated) {
      setShowAuth(false);
    }
    setSecretClicks(0);
  };

  const handleConnect = () => {
    onConnect();
    // Keep the modal open or close based on preference
    // handleClose(); 
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 p-2.5 sm:p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-indigo-300 group"
        aria-label="Open settings"
      >
        <Settings 
          className="text-gray-600 group-hover:text-indigo-600 group-hover:rotate-90 transition-all duration-300" 
          size={20}
        />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
            onClick={handleClose}
          />

          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center gap-2">
                <Settings className="text-indigo-600" size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Settings</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Connection Status */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Connection Status</h3>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-700 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-sm text-red-700 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
                {isAuthenticated && (
                  <p className="text-[10px] text-gray-400 mt-2 break-all font-mono">
                    {backendUrl}
                  </p>
                )}
              </div>

              {/* Developer Options (The Secret Section) */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <button
                  onClick={handleSecretClick}
                  className="w-full text-left flex items-center justify-between group"
                >
                  <span className="text-sm font-semibold text-gray-700">Developer Options</span>
                  {secretClicks > 0 && (
                    <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                      {secretClicks} / {TARGET_CLICKS}
                    </span>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1">Advanced settings for developers</p>

                {/* The Reveal */}
                {showAuth && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-4 text-amber-600">
                      <Lock size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Developer Mode Active
                      </span>
                    </div>
                    <AuthPanel
                      backendUrl={backendUrl}
                      setBackendUrl={setBackendUrl}
                      sessionCookie={sessionCookie}
                      setSessionCookie={setSessionCookie}
                      onConnect={handleConnect}
                    />
                  </div>
                )}
              </div>

              {/* Version Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">App Information</h3>
                <p className="text-xs text-gray-500">Version 1.0.0 • Build 2025.01</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}