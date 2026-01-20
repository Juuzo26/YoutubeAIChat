import React, { useState, useMemo } from 'react';
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

  // Backend sends pre-formatted paragraphs with \n\n separators
  const formattedTranscript = useMemo(() => {
    if (!transcript) return [];
    
    // Split by double newlines (backend provides this)
    const paragraphs = transcript
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // Fallback: If no paragraphs, split manually
    if (paragraphs.length === 1 && paragraphs[0].length > 500) {
      const sentences = paragraphs[0].match(/[^.!?]+[.!?]+/g) || [paragraphs[0]];
      const chunks = [];
      let currentChunk = '';
      
      sentences.forEach((sentence, i) => {
        currentChunk += sentence + ' ';
        if ((i + 1) % 4 === 0 || i === sentences.length - 1) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      });
      
      return chunks;
    }
    
    return paragraphs;
  }, [transcript]);

  const wordCount = transcript.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]"
      role="region"
      aria-label="Video transcript"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <FileText 
            className="text-indigo-600 flex-shrink-0" 
            size={18}
            aria-hidden="true"
          />
          <h3 className="font-bold text-sm sm:text-base">Transcript</h3>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
          aria-label={copied ? "Transcript copied" : "Copy transcript to clipboard"}
        >
          {copied ? (
            <>
              <Check 
                size={18} 
                className="text-green-600"
                aria-hidden="true"
              />
              <span className="sr-only">Copied!</span>
            </>
          ) : (
            <>
              <Copy 
                size={18} 
                className="text-gray-600 group-hover:text-indigo-600"
                aria-hidden="true"
              />
              <span className="sr-only">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto pr-2 space-y-4"
        role="article"
        aria-label="Transcript content"
      >
        {/* Video Name */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed">
            <span className="sr-only">Video title: </span>
            {videoName}
          </p>
        </div>

        <div className="h-px bg-gray-100" role="separator" aria-hidden="true" />

        {/* Formatted Transcript - Now with paragraphs */}
        <div className="space-y-4">
          <span className="sr-only">Transcript: </span>
          {formattedTranscript.map((paragraph, idx) => (
            <p 
              key={idx}
              className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div 
        className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-400"
        role="status"
        aria-label={`Transcript contains ${wordCount} words, ${readingTime} min read`}
      >
        <span>{wordCount} words</span>
        <span>•</span>
        <span>{readingTime} min read</span>
      </div>
    </div>
  );
}