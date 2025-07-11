'use client';

import React from 'react';

interface PracticeModeSelectorProps {
  practiceMode: 'free' | 'scenario' | null;
  setPracticeMode: (mode: 'free' | 'scenario' | null) => void;
  recording: boolean;
  resetAllStates: () => void;
}

const PracticeModeSelector: React.FC<PracticeModeSelectorProps> = ({
  practiceMode,
  setPracticeMode,
  recording,
  resetAllStates,
}) => {
  const handleModeSelection = (mode: 'free' | 'scenario') => {
    resetAllStates(); // Reset all states when changing mode
    setPracticeMode(mode);
  };

  return (
    <div className="relative overflow-hidden p-1">
      {/* Dynamic Background */}

      {/* Main Container */}
      <div className="relative backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
              Enhance Your Speech
            </h2>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full delay-500"></div>
          </div>
          <p className="text-white/60 text-sm tracking-widest uppercase font-medium">
            Select Your Enhancement Mode
          </p>
          
        </div>

        {/* Mode Selection Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Speech Mode */}
          <button
            className={`group relative overflow-hidden p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
              practiceMode === 'free'
                ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/25'
                : 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-white/10 hover:border-cyan-400/30'
            } ${recording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleModeSelection('free')}
            disabled={recording}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Floating Orbs */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-400/30 rounded-full "></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full  delay-300"></div>
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Icon */}
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <div className="text-3xl">🌊</div>
                </div>
                {practiceMode === 'free' && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-20 animate-pulse"></div>
                )}
              </div>
              
              {/* Title */}
              <div className="text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
                  Flow State Mode
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Unrestricted neural pathways for<br />
                  <span className="text-cyan-300 font-medium">organic expression</span>
                </p>
              </div>
              
              {/* Status Indicator */}
              {practiceMode === 'free' && (
                <div className="flex justify-center">
                  <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-xs text-cyan-300 font-medium">
                    ACTIVE
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Scenario Mode */}
          <button
            className={`group relative overflow-hidden p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
              practiceMode === 'scenario'
                ? 'bg-gradient-to-br from-purple-500/30 to-pink-600/30 border-2 border-purple-400/50 shadow-xl shadow-purple-500/25'
                : 'bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-white/10 hover:border-purple-400/30'
            } ${recording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleModeSelection('scenario')}
            disabled={recording}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Floating Orbs */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-purple-400/30 rounded-full  delay-150"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-400/30 rounded-full  delay-500"></div>
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Icon */}
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <div className="text-3xl">⚡</div>
                </div>
                {practiceMode === 'scenario' && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl opacity-20 animate-pulse"></div>
                )}
              </div>
              
              {/* Title */}
              <div className="text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                  Simulation Protocol
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Structured training environments for<br />
                  <span className="text-purple-300 font-medium">targeted skill enhancement</span>
                </p>
              </div>
              
              {/* Status Indicator */}
              {practiceMode === 'scenario' && (
                <div className="flex justify-center">
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-300 font-medium">
                    ACTIVE
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Bottom Status Bar */}
        {practiceMode && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black/30 border border-white/10 rounded-full backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                practiceMode === 'free' ? 'bg-cyan-400' : 'bg-purple-400'
              }`}></div>
              <span className="text-white/80 text-sm font-medium">
                {practiceMode === 'free' ? 'Flow State' : 'Simulation'} Protocol Initialized
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeModeSelector;