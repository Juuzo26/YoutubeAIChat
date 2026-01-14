import React from 'react';
import { MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatPanel({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  chatLoading, 
  messagesEndRef,
  onSendMessage,
  onClearChat 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !chatLoading) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const canSend = inputMessage.trim() && !chatLoading;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-gray-50 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-indigo-600 flex-shrink-0" size={18} />
          <h3 className="font-bold text-sm sm:text-base">Chat with Memory</h3>
        </div>
        <button 
          onClick={onClearChat}
          disabled={messages.length === 0}
          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed" 
          title="Clear Chat Memory"
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50/30">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center px-4">
            <p>No messages yet. Start chatting about the video!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))
        )}

        {/* Loading Indicator */}
        {chatLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white border rounded-2xl p-3 sm:p-4 shadow-sm">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
            </div>
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about the video..."
            disabled={chatLoading}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base"
          />
          <button 
            onClick={onSendMessage}
            disabled={!canSend}
            className="px-4 sm:px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            title="Send message"
          >
            <Send size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}