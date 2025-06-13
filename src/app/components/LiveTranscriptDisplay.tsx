'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LiveTranscriptDisplayProps {
  liveTranscript: string;
  highlightTranscript: (text: string | null) => React.ReactNode;
}

const LiveTranscriptDisplay: React.FC<LiveTranscriptDisplayProps> = ({
  liveTranscript,
  highlightTranscript,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveTranscript) {
      setIsListening(true);
      setWordCount(liveTranscript.trim().split(/\s+/).filter(word => word.length > 0).length);
      setLastUpdate(new Date());
      
      // Auto-scroll to bottom when new content arrives
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      
      // Reset listening state after a delay if no new content
      const timeout = setTimeout(() => setIsListening(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [liveTranscript]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic background with listening state */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 opacity-95"></div>
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isListening 
          ? 'bg-gradient-to-tr from-cyan-600/20 via-blue-500/15 to-purple-400/20' 
          : 'bg-gradient-to-tr from-cyan-600/10 via-transparent to-blue-400/15'
      }`}></div>
      
      {/* Ambient lighting that responds to activity */}
      <div className={`absolute top-8 right-8 w-32 h-32 rounded-full blur-xl transition-all duration-1000 ${
        isListening 
          ? 'bg-gradient-to-r from-cyan-400/30 to-blue-400/25' 
          : 'bg-gradient-to-r from-cyan-400/15 to-blue-400/20'
      }`}></div>
      <div className="absolute bottom-8 left-8 w-28 h-28 bg-gradient-to-r from-purple-400/15 to-cyan-300/20 rounded-full blur-2xl"></div>
      
      {/* Main container */}
      <div className="relative backdrop-blur-2xl bg-black/25 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Enhanced header with live status */}
        <div className="relative p-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-400' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}></div>
                {isListening && (
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-30 scale-150"></div>
                )}
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent tracking-wide">
                LIVE TRANSCRIPT
              </h2>
            </div>
            
            {/* Status indicator */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 ${
              isListening 
                ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-200' 
                : 'bg-gray-500/20 border-gray-400/30 text-gray-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isListening ? 'bg-cyan-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-bold tracking-wider">
                {isListening ? 'LISTENING' : 'STANDBY'}
              </span>
            </div>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
          
          {/* Stats bar */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-white/60">Words:</span>
                <span className="text-cyan-300 font-bold">{wordCount}</span>
              </div>
              {lastUpdate && (
                <div className="flex items-center space-x-2">
                  <span className="text-white/60">Last update:</span>
                  <span className="text-blue-300 font-mono">{formatTime(lastUpdate)}</span>
                </div>
              )}
            </div>
            
            {/* Live indicator */}
            {isListening && (
              <div className="flex items-center space-x-2 text-cyan-300">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-cyan-400 rounded-full opacity-60"></div>
                  <div className="w-1 h-4 bg-cyan-400 rounded-full opacity-80 delay-100"></div>
                  <div className="w-1 h-4 bg-cyan-400 rounded-full delay-200"></div>
                </div>
                <span className="text-xs font-bold tracking-wider">PROCESSING</span>
              </div>
            )}
          </div>
        </div>

        {/* Content area with enhanced styling */}
        <div className="relative px-8 pb-8">
          <div className="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
            {/* Inner glow effect */}
            <div className={`absolute inset-0 pointer-events-none rounded-2xl transition-all duration-1000 ${
              isListening 
                ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10' 
                : 'bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5'
            }`}></div>
            
            <div 
              ref={scrollRef}
              className="relative p-8 min-h-[350px] max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-400/30"
            >
              {liveTranscript ? (
                <div className="space-y-4">
                  {/* Transcript content with enhanced styling */}
                  <div className="text-white/95 whitespace-pre-wrap break-words leading-loose text-lg font-light tracking-wide">
                    {highlightTranscript(liveTranscript)}
                  </div>
                  
                  {/* Live typing indicator */}
                  {isListening && (
                    <div className="flex items-center space-x-2 mt-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-40"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-80"></div>
                      </div>
                      <span className="text-cyan-300/70 text-sm italic">transcribing...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-6">
                    {/* Enhanced empty state */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-cyan-600/30 to-blue-500/40 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                        <div className="text-5xl opacity-60">🎤</div>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-400/30 rounded-3xl blur opacity-40"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-white/80 text-xl font-medium">Ready to Transcribe</p>
                      <p className="text-white/50 text-base">Start speaking to see real-time transcription</p>
                      <div className="flex items-center justify-center space-x-2 text-cyan-300/60 text-sm">
                        <div className="w-2 h-2 bg-cyan-400/40 rounded-full"></div>
                        <span>Listening for audio input</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom gradient fade for long content */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTranscriptDisplay;