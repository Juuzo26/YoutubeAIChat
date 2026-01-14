import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ConnectionStatus({ backendUrl, onEdit }) {
  // Truncate long URLs for mobile display
  const displayUrl = backendUrl.length > 40 
    ? `${backendUrl.substring(0, 37)}...` 
    : backendUrl;

  return (
    <div className="bg-indigo-600 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 shadow-md">
      <div className="flex items-center gap-2 sm:gap-3">
        <CheckCircle size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium break-all">
          Authenticated: <span className="hidden sm:inline">{backendUrl}</span>
          <span className="sm:hidden">{displayUrl}</span>
        </span>
      </div>
      <button 
        onClick={onEdit} 
        className="text-xs bg-white/20 px-3 py-1.5 rounded hover:bg-white/30 transition-colors whitespace-nowrap self-end sm:self-auto"
      >
        Edit Connection
      </button>
    </div>
  );
}