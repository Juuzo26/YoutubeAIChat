import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`
          rounded-2xl p-3 sm:p-4 shadow-sm text-sm sm:text-base
          ${isUser 
            ? 'bg-indigo-600 text-white max-w-[85%] sm:max-w-[80%]' 
            : isSystem 
            ? 'bg-amber-50 text-amber-800 border border-amber-100 italic text-center w-full' 
            : 'bg-white border border-gray-200 text-gray-800 max-w-[85%] sm:max-w-[80%]'
          }
        `}
      >
        {/* Render Markdown for AI and User, but keep simple text for System */}
        <div className={`
          ${!isUser ? 'prose prose-sm sm:prose-base max-w-none prose-slate' : ''} 
          ${isUser ? 'text-white' : 'text-gray-800'}
          leading-relaxed break-words
        `}>
          {isSystem ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isSystem && message.timestamp && (
          <span className={`text-[10px] mt-2 block ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </div>
  );
}