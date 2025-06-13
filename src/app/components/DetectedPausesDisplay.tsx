'use client';

import React from 'react';

interface DetectedPausesDisplayProps {
  pauses: { start: number; end: number }[];
}

const DetectedPausesDisplay: React.FC<DetectedPausesDisplayProps> = ({ pauses }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Static background gradients */}
      
      {/* Subtle ambient lighting */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-gradient-to-r from-yellow-400/40 to-amber-400/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-12 right-12 w-36 h-36 bg-gradient-to-r from-purple-400/15 to-yellow-300/20 rounded-full blur-2xl"></div>
      
      {/* Main container */}
      <div className="relative backdrop-blur-2xl bg-black/50 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"></div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-yellow-200 to-amber-200 bg-clip-text text-transparent tracking-wide">
              DETECTED PAUSES
            </h2>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>
        </div>

        {/* Content area */}
        <div className="relative px-8 pb-8">
          <div className="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/10 pointer-events-none"></div>
            
            <div className="relative p-8 min-h-[300px] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-yellow-400/30">
              {pauses.length > 0 ? (
                <div className="space-y-4">
                  {pauses.map((pause, idx) => (
                    <div key={idx} className="relative group">
                      {/* Pause item container */}
                      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all duration-200">
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-amber-500/5 rounded-xl pointer-events-none"></div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Enhanced pause number */}
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <span className="text-black font-black text-lg">{idx + 1}</span>
                              </div>
                              <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl blur opacity-20"></div>
                            </div>
                            
                            <div>
                              <span className="text-white/90 font-semibold text-lg tracking-wide">
                                Pause Detected
                              </span>
                              <div className="text-yellow-200/60 text-sm font-medium">
                                Silence duration analysis
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced timing display */}
                          <div className="text-right space-y-1">
                            <div className="text-cyan-300 font-bold text-lg">
                              {typeof pause.start === 'number' ? pause.start.toFixed(2) : '0.00'}s - {typeof pause.end === 'number' ? pause.end.toFixed(2) : '0.00'}s
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white/60 text-sm">Duration:</span>
                              <span className="text-yellow-300 font-bold text-sm">
                                {typeof pause.end === 'number' && typeof pause.start === 'number' ? (pause.end - pause.start).toFixed(2) : '0.00'}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center space-y-6">
                    {/* Enhanced empty state icon */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-600/30 to-gray-500/40 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                        <span className="text-4xl opacity-60">⏸</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-gray-500/20 to-gray-400/30 rounded-2xl blur opacity-30"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-white/60 text-lg font-medium">No Pauses Detected</p>
                      <p className="text-white/40 text-sm">Silence analysis will appear here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectedPausesDisplay;