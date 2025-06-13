'use client';

import React from 'react';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ videoRef }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Static background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-purple-400/20"></div>
      
      {/* Subtle ambient lighting */}
      <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/15 rounded-full blur-xl"></div>
      <div className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-r from-purple-400/15 to-indigo-400/20 rounded-full blur-2xl"></div>
      
      {/* Main container */}
      <div className="relative backdrop-blur-2xl bg-black/60 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent tracking-wide">
              CAMERA PREVIEW
            </h2>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
        </div>

        {/* Video container */}
        <div className="relative px-8 pb-8">
          <div className="relative group">
            {/* Video frame with enhanced styling */}
            <div className="relative backdrop-blur-xl bg-black/30 border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
              
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto relative z-10 rounded-2xl"
              />
              
              {/* Recording indicator */}
              <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center space-x-2 backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-200 text-xs font-bold tracking-wider">LIVE</span>
                </div>
              </div>
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-2xl"></div>
            </div>
            
            {/* Subtle outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;