import React from 'react';
import { Lock } from 'lucide-react';

export default function AuthPanel({ 
  backendUrl, 
  setBackendUrl, 
  sessionCookie, 
  setSessionCookie, 
  onConnect 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
      <div className="flex items-start gap-3">
        <Lock className="text-indigo-500 mt-1 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">
            Connect to Backend
          </h3>
          <div className="space-y-4">
            {/* Ngrok URL Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Ngrok URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://xxxx.ngrok-free.app"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              />
            </div>

            {/* Session Cookie Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Colab Session Cookie
              </label>
              <textarea
                value={sessionCookie}
                onChange={(e) => setSessionCookie(e.target.value)}
                placeholder="Paste cookie value here..."
                rows="3"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-xs resize-none transition-all"
              />
            </div>

            {/* Connect Button */}
            <button
              onClick={onConnect}
              disabled={!backendUrl || !sessionCookie}
              className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-all text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              Connect & Authenticate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}