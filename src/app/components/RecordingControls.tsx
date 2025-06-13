'use client';
import React from 'react';

interface RecordingControlsProps {
  recording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  practiceMode: 'free' | 'scenario' | null;
  currentPrompt: string;
  customPromptInput: string;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  recording,
  startRecording,
  stopRecording,
  practiceMode,
  currentPrompt,
  customPromptInput,
}) => {
  const isDisabled = !practiceMode || (practiceMode === 'scenario' && !currentPrompt && !customPromptInput);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 opacity-30 blur-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-full scale-150 animate-pulse"></div>
      
      {/* Main container */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-black/60 rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
        {/* Floating orbs */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full opacity-40 animate-pulse"></div>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`relative w-4 h-4 rounded-full ${recording ? 'bg-red-500' : 'bg-gray-600'} shadow-lg`}>
            {recording && (
              <>
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse"></div>
              </>
            )}
          </div>
          <span className={`ml-3 text-sm font-medium ${recording ? 'text-red-400' : 'text-gray-400'}`}>
            {recording ? 'LIVE RECORDING' : 'STANDBY'}
          </span>
        </div>

        {/* Main recording button */}
        <div className="relative group">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={isDisabled}
            className={`
              relative w-full h-20 rounded-2xl font-bold text-lg transition-all duration-500 overflow-hidden
              ${isDisabled 
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-500 cursor-not-allowed' 
                : recording
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50'
                  : 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              }
              ${!isDisabled && 'hover:scale-105 active:scale-95'}
            `}
          >
            {/* Animated background overlay */}
            <div className={`
              absolute inset-0 opacity-0 transition-opacity duration-300
              ${!isDisabled && 'group-hover:opacity-20'}
              bg-gradient-to-r from-white via-purple-200 to-white
            `}></div>
            
            {/* Shimmer effect */}
            <div className={`
              absolute inset-0 -skew-x-12 transform translate-x-full transition-transform duration-1000
              ${!isDisabled && 'group-hover:-translate-x-full'}
              bg-gradient-to-r from-transparent via-white/20 to-transparent
            `}></div>
            
            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xl
                ${recording 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : isDisabled 
                    ? 'bg-gray-600/50' 
                    : 'bg-white/10 backdrop-blur-sm'
                }
              `}>
                {recording ? '⏹' : '▶'}
              </div>
              <span className="tracking-wide">
                {recording ? 'STOP RECORDING' : 'START RECORDING'}
              </span>
            </div>
            
            {/* Pulse rings for recording state */}
            {recording && (
              <>
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"></div>
                <div className="absolute inset-2 rounded-xl border border-white/20 animate-pulse"></div>
              </>
            )}
          </button>
        </div>

        {/* Status messages */}
        <div className="mt-6 space-y-3">
          {!practiceMode && (
            <div className="relative p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-xl"></div>
              <div className="relative flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-amber-200 text-sm font-medium">
                  Please select a practice mode to begin
                </span>
              </div>
            </div>
          )}
          
          {practiceMode === 'scenario' && !currentPrompt && !customPromptInput && (
            <div className="relative p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-xl"></div>
              <div className="relative flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 text-sm font-medium">
                  Please select a scenario or enter a custom prompt
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-px left-1/4 w-16 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        <div className="absolute -bottom-px right-1/4 w-20 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
      </div>
      
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-3xl border border-purple-500/10 scale-105"></div>
      <div className="absolute inset-0 rounded-3xl border border-violet-500/5 scale-110"></div>
    </div>
  );
};

export default RecordingControls;