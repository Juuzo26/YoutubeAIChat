import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProcessingIndicator() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100 animate-in fade-in">
      <Loader2 
        className="animate-spin text-indigo-600 mx-auto mb-4" 
        size={40} 
      />
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
        Generating Transcript...
      </h2>
      <p className="text-sm sm:text-base text-gray-500">
        Downloading and transcribing video. Please wait.
      </p>
      
      {/* Optional: Add progress tips */}
      <div className="mt-6 text-xs sm:text-sm text-gray-400 italic">
        This may take 30-60 seconds depending on video length
      </div>
    </div>
  );
}