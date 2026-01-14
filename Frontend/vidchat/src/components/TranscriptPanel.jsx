import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

export default function TranscriptPanel({ videoName, transcript }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <FileText className="text-indigo-600 flex-shrink-0" size={18} />
          <h3 className="font-bold text-sm sm:text-base">Transcript</h3>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
          title="Copy transcript"
        >
          {copied ? (
            <Check size={18} className="text-green-600" />
          ) : (
            <Copy size={18} className="text-gray-600 group-hover:text-indigo-600" />
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {/* Video Name */}
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
          "{videoName}"
        </p>

        <div className="h-px bg-gray-100" />

        {/* Transcript Text */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {transcript}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t text-xs text-gray-400 text-center">
        {transcript.split(' ').length} words
      </div>
    </div>
  );
}