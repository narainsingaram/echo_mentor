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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Practice Mode</h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          className={`group relative overflow-hidden p-6 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
            practiceMode === 'free'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
          onClick={() => handleModeSelection('free')}
          disabled={recording}
        >
          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 text-white">
            <div className="text-3xl mb-3">💬</div>
            <div className="text-xl font-semibold mb-1">Free Speech Mode</div>
            <div className="text-sm text-blue-100">Practice without constraints</div>
          </div>
        </button>

        <button
          className={`group relative overflow-hidden p-6 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
            practiceMode === 'scenario'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-purple-500/25'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
          onClick={() => handleModeSelection('scenario')}
          disabled={recording}
        >
          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 text-white">
            <div className="text-3xl mb-3">🎯</div>
            <div className="text-xl font-semibold mb-1">Practice Scenarios</div>
            <div className="text-sm text-purple-200">Guided practice sessions</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PracticeModeSelector;