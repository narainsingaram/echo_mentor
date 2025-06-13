'use client';

import React from 'react';

interface FinalTranscriptDisplayProps {
  transcript: string;
  highlightTranscript: (text: string | null) => React.ReactNode;
  countFillerWords: (text: string) => number;
}

const FinalTranscriptDisplay: React.FC<FinalTranscriptDisplayProps> = ({
  transcript,
  highlightTranscript,
  countFillerWords,
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradients */}
      
      {/* Floating orbs for ambient effect */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-pink-200/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-300/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      {/* Main container with glassmorphism */}
      <div className="relative backdrop-blur-2xl bg-black/50 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with neon accent */}
        <div className="relative p-8 pb-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-wide">
              FINAL TRANSCRIPT
            </h2>
          </div>
          
          {/* Animated underline */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse"></div>
        </div>

        {/* Content area with enhanced styling */}
        <div className="relative px-8 pb-8">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none"></div>
            
            <div className="relative p-8 min-h-[300px] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-purple-400/30">
              <div className="text-white/90 whitespace-pre-wrap break-words leading-loose text-lg font-light tracking-wide">
                {highlightTranscript(transcript) || (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-pink-400/20 border-t-pink-400/50 rounded-full animate-spin mx-auto delay-150"></div>
                      </div>
                      <span className="text-purple-200/60 italic text-xl font-light">
                        Awaiting your voice transmission...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced filler words alert */}
          {transcript && (
            <div className="mt-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 blur-xl"></div>
              <div className="relative backdrop-blur-xl bg-red-900/20 border border-red-400/30 rounded-2xl p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                      <span className="text-white font-black text-xl">!</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-red-200 text-lg mb-1 tracking-wide">
                      SPEECH ANALYSIS
                    </h4>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-4xl font-black bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">
                        {countFillerWords(transcript)}
                      </span>
                      <span className="text-red-200/80 font-medium">filler words detected</span>
                    </div>
                  </div>
                  
                  {/* Pulsing indicator */}
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalTranscriptDisplay;