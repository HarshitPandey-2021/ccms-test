// src/components/Loader.jsx
import React from 'react';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm">
      <div className="text-center">
        {/* Unique Morphing Gradient Loader */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-700/50" />
          
          {/* Spinning Gradient Arc */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" 
               style={{ animationDuration: '0.8s' }} />
          
          {/* Inner Pulsing Core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-80" />
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-white text-lg font-medium mb-2">{message}</p>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.6s' }} />
        </div>
      </div>
    </div>
  );
};

export default Loader;