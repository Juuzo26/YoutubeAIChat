import React from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';

export default function VideoInput({ 
  videoUrl, 
  setVideoUrl, 
  loading, 
  error, 
  onProcess 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      onProcess();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Video className="text-indigo-600 flex-shrink-0" size={20} />
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
          Process YouTube Video
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Paste YouTube link here..."
          disabled={loading}
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base"
        />
        <button
          onClick={onProcess}
          disabled={loading || !videoUrl.trim()}
          className="px-4 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span className="hidden sm:inline">Processing...</span>
            </>
          ) : (
            <span>Start Analysis</span>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 border border-red-100 animate-in fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}