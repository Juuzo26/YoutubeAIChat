import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log this to your backend service later
    console.error("Component Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-full min-h-[200px] text-center">
          <AlertTriangle className="text-amber-500 mb-2" size={32} />
          <h3 className="text-sm font-bold text-slate-800">Panel Unavailable</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
            Something went wrong while rendering this section.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={12} /> Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;