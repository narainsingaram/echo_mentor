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
      {/* Ambient floating elements */}
      <div className="pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-purple-300/20 to-pink-300/10 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-16 right-16 w-48 h-48 bg-gradient-to-r from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl animate-float-slower delay-500"></div>
      </div>

      {/* Main glass container */}
      <div className="relative z-10 backdrop-blur-xl bg-black/60 border border-white/10 rounded-3xl shadow-2xl transition-shadow duration-500 hover:shadow-purple-500/20">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center space-x-4 mb-2">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-50 blur-sm animate-ping"></div>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              FINAL TRANSCRIPT
            </h2>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
        </div>

        {/* Transcript Display Area */}
        <div className="px-8 pb-8">
          <div className="relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:ring-1 hover:ring-purple-400/40 transition-all duration-300">
            {/* Soft ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none animate-pulse-slow"></div>

            {/* Scrollable transcript area */}
            <div className="relative p-8 min-h-[300px] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400/30 scrollbar-track-transparent scroll-shadow-fade">
              <div className="text-white/90 whitespace-pre-wrap break-words leading-relaxed text-lg font-light tracking-wide">
                {highlightTranscript(transcript) || (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="relative mx-auto">
                        <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-pink-400/20 border-t-pink-400/50 rounded-full animate-spin-reverse-slower"></div>
                      </div>
                      <p className="text-purple-200/70 italic text-lg">Awaiting your voice transmission...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filler Words Analysis */}
          {transcript && (
            <div className="mt-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 blur-2xl"></div>
              <div className="relative backdrop-blur-2xl bg-red-900/30 border border-red-400/30 rounded-2xl p-6 shadow-lg shadow-red-400/10">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
                      <span className="text-white font-black text-xl">!</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl blur opacity-25 animate-ping"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-200 text-lg tracking-wide">SPEECH ANALYSIS</h4>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-extrabold bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">
                        {countFillerWords(transcript)}
                      </span>
                      <span className="text-red-200/80 text-sm">filler words detected</span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-md shadow-red-400/40"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float 18s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 5s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 2.5s linear infinite;
        }
        .animate-spin-reverse-slower {
          animation: spin-reverse 4s linear infinite;
        }
        .scroll-shadow-fade::-webkit-scrollbar-thumb {
          border-radius: 9999px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-12px) }
        }

        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default FinalTranscriptDisplay;
