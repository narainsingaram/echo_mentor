'use client';

import React from 'react';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ videoRef }) => {
  return (
    <div className="relative overflow-hidden min-h-[500px] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 animate-gradient-x"></div>
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>

      {/* Ambient Glow Orbs */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-500/25 rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/2 right-20 w-24 h-24 bg-violet-400/20 rounded-full blur-2xl"></div>

      {/* Frame */}
      <div className="relative w-full max-w-4xl rounded-3xl shadow-[0_20px_80px_rgba(128,90,213,0.3)] border border-white/20 backdrop-blur-xl bg-black/60">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-300 to-blue-300 bg-clip-text text-transparent tracking-wide uppercase">
              Camera Live Feed
            </h2>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
        </div>

        {/* Video Container */}
        <div className="relative px-6 pb-8">
          <div className="relative group overflow-hidden rounded-2xl border-2 border-white/15 shadow-inner shadow-black/30">
            {/* Inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-400/10 to-blue-500/10 pointer-events-none z-0"></div>

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="relative z-10 w-full h-auto object-contain rounded-2xl shadow-2xl"
            />

            {/* Recording Indicator */}
            <div className="absolute top-4 right-4 z-20 animate-pulse">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-full shadow-red-500/20 shadow-md">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-200 font-bold tracking-wider uppercase">
                  Recording
                </span>
              </div>
            </div>

            {/* Futuristic Corners */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, idx) => (
              <div
                key={idx}
                className={`absolute ${pos} w-6 h-6 border-2 border-white/20 rounded-${
                  idx === 0 ? 'tl' : idx === 1 ? 'tr' : idx === 2 ? 'bl' : 'br'
                }-2xl`}
              ></div>
            ))}

            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 blur-2xl opacity-60 group-hover:opacity-90 transition duration-500 z-0"></div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-x {
          background-size: 300% 300%;
          animation: gradient-x 10s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraPreview;