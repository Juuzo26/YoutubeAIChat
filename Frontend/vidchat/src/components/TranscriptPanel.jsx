import React, { useState, useMemo } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

export default function TranscriptPanel({ videoName, transcript }) {
  const [copied, setCopied] = useState(false);

  // // Test Error Boundaries
  // if (transcript && transcript.length > 0) {
  //     throw new Error("Testing Error Boundary Graceful Degradation!");
  //   } 

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formattedTranscript = useMemo(() => {
    if (!transcript) return [];
    
    // Split by double line breaks
    const paragraphs = transcript
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // Fallback: If no double-newlines, split by sentences into chunks of 4
    if (paragraphs.length === 1) {
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

  // ✅ IMPROVED: Word count now uses regex to be more accurate
  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <section 
      className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]"
      aria-labelledby="unique-transcript-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <FileText 
            className="text-indigo-600 flex-shrink-0" 
            size={18}
            aria-hidden="true"
          />
          <h3 id="unique-transcript-title" className="font-bold text-sm sm:text-base text-gray-900">
            Video Transcript Content
          </h3>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
          aria-label={copied ? "Transcript copied" : "Copy transcript to clipboard"}
        >
          {copied ? (
            <Check size={18} className="text-green-600" aria-hidden="true" />
          ) : (
            <Copy size={18} className="text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Scrollable Content - ✅ ACCESSIBILITY: Added tabIndex and Focus Ring */}
      <div 
        className="flex-1 overflow-y-auto pr-2 space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
        tabIndex={0}
        role="region"
        aria-label="Transcript text scroll area"
      >
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed">
            <span className="sr-only">Video title: </span>
            {videoName}
          </p>
        </div>

        <div className="h-px bg-gray-100" role="separator" aria-hidden="true" />

        <div className="space-y-4">
          <span className="sr-only">Transcript content:</span>
          {formattedTranscript.map((paragraph, idx) => (
            <p 
              key={idx} 
              className="text-sm sm:text-base text-gray-800 leading-relaxed text-justify"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Footer Info - ✅ ACCESSIBILITY: Increased contrast to text-gray-600 */}
      <div 
        className="mt-3 pt-3 border-t flex items-center justify-between text-xs font-medium text-gray-600"
        role="status"
        aria-label={`Transcript contains ${wordCount} words, ${readingTime} min read`}
      >
        <span>{wordCount} words</span>
        <span aria-hidden="true">•</span>
        <span>{readingTime} min read</span>
      </div>
    </section>
  );
}