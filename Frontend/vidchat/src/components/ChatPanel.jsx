import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Send, Loader2, Settings2, CheckCircle2, X, Save, Bookmark, History } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatPanel({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  chatLoading, 
  messagesEndRef,
  onSendMessage,
  onClearChat,
  replyStyle,
  setReplyStyle
}) {
  const [showStyleInput, setShowStyleInput] = useState(false);
  const [savedStyles, setSavedStyles] = useState([]);
  
  useEffect(() => {
    const library = localStorage.getItem('ai_style_library');
    if (library) {
      try {
        setSavedStyles(JSON.parse(library));
      } catch (e) {
        console.error("Failed to parse persona library", e);
      }
    }
  }, []);

  const isDefault = !replyStyle || replyStyle === 'Helpful and concise';

  const canSaveStyle = () => {
    const trimmed = replyStyle?.trim() || '';
    return trimmed.length >= 2 && 
           trimmed !== 'Helpful and concise' && 
           !savedStyles.includes(trimmed);
  };

  const handleSaveStyle = () => {
    const trimmed = replyStyle?.trim() || '';
    if (!canSaveStyle()) return;
    
    const newLibrary = [...savedStyles, trimmed];
    setSavedStyles(newLibrary);
    localStorage.setItem('ai_style_library', JSON.stringify(newLibrary));
  };

  const removeSavedStyle = (e, styleToRemove) => {
    e.stopPropagation();
    const newLibrary = savedStyles.filter(s => s !== styleToRemove);
    setSavedStyles(newLibrary);
    localStorage.setItem('ai_style_library', JSON.stringify(newLibrary));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !chatLoading) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-indigo-600 flex-shrink-0" size={18} aria-hidden="true" />
          <h3 className="font-bold text-sm sm:text-base text-gray-800">Chat with Memory</h3>
          {!isDefault && (
            <span 
              role="status" 
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold animate-pulse"
            >
              <CheckCircle2 size={10} aria-hidden="true" /> {replyStyle.toUpperCase()} ACTIVE
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowStyleInput(!showStyleInput)}
            className={`p-1.5 rounded-lg transition-all ${showStyleInput ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-200'}`}
            title="Persona Library"
            aria-label="Toggle Persona Library Settings"
            aria-expanded={showStyleInput}
          >
            <Settings2 size={18} aria-hidden="true" />
          </button>
          
          {/* FIX 1: Added aria-label to Clear Chat button */}
          <button 
            onClick={onClearChat} 
            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg"
            aria-label="Clear all messages"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Persona Library Area */}
      {showStyleInput && (
        <div className={`border-b p-3 animate-in slide-in-from-top duration-200 ${isDefault ? 'bg-indigo-50/80' : 'bg-green-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <label id="library-label" className={`text-[10px] font-bold uppercase tracking-wider ${isDefault ? 'text-indigo-600' : 'text-green-700'}`}>
              Persona Library
            </label>
            <button 
              onClick={() => setShowStyleInput(false)} 
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close library"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <input 
              type="text"
              value={replyStyle}
              onChange={(e) => setReplyStyle(e.target.value)}
              placeholder="e.g. Angry Mother, Pirate..."
              aria-labelledby="library-label"
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button 
              onClick={handleSaveStyle}
              disabled={!canSaveStyle()}
              className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
              title={!canSaveStyle() ? "Type at least 2 characters to save" : "Save to library"}
              aria-label="Save persona to library"
            >
              <Save size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto" role="list" aria-label="Saved personas">
            <button 
              onClick={() => setReplyStyle('Helpful and concise')}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between group ${isDefault ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-white/50 text-gray-600'}`}
              aria-current={isDefault ? 'true' : 'false'}
            >
              <span className="flex items-center gap-2"><History size={12} aria-hidden="true"/> Default (Helpful & Concise)</span>
            </button>
            
            {savedStyles.map((style, idx) => (
              <div key={idx} className="group flex items-center gap-1" role="listitem">
                <button 
                  onClick={() => setReplyStyle(style)}
                  className={`flex-1 text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-2 ${replyStyle === style ? 'bg-green-100 text-green-700 font-bold' : 'hover:bg-white/50 text-gray-600'}`}
                  aria-current={replyStyle === style ? 'true' : 'false'}
                >
                  <Bookmark size={12} className={replyStyle === style ? 'fill-green-700' : ''} aria-hidden="true"/> {style}
                </button>
                <button 
                  onClick={(e) => removeSavedStyle(e, style)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  aria-label={`Remove ${style} from library`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet.</div>
        ) : (
          messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)
        )}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl p-3 shadow-sm" aria-label="AI is typing">
              <Loader2 className="animate-spin text-indigo-600" size={20} aria-hidden="true" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={(e) => { e.preventDefault(); onSendMessage(); }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isDefault ? "Ask about the video..." : `Persona: ${replyStyle}`}
              aria-label="Message text"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {/* FIX 2: Added aria-label to Send button */}
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || chatLoading} 
              className="px-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300"
              aria-label="Send message"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}