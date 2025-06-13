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
    <div className="text-center">
      <button
        className={`group relative px-12 py-6 rounded-3xl text-white text-2xl font-semibold transition-all duration-300 ease-in-out transform ${
          recording
            ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse shadow-[0_0_25px_5px_rgba(239,68,68,0.4)]'
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-[0_0_25px_5px_rgba(34,197,94,0.3)]'
        } ${isDisabled && 'opacity-50 cursor-not-allowed hover:scale-100'} hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30`}
        onClick={recording ? stopRecording : startRecording}
        disabled={isDisabled}
      >
        {/* Overlay shine on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center space-x-4">
          <span className={`text-4xl transition-transform duration-300 ${recording ? 'animate-pulse' : 'group-hover:scale-110'}`}>
            {recording ? '⏹' : '▶'}
          </span>
          <span className="tracking-wide">{recording ? 'Stop Recording' : 'Start Recording'}</span>
        </div>
      </button>

      {!practiceMode && (
        <p className="text-gray-500 mt-4 bg-gray-100 px-4 py-2 rounded-lg inline-block">
          Please select a practice mode to begin
        </p>
      )}

      {practiceMode === 'scenario' && !currentPrompt && !customPromptInput && (
        <p className="text-purple-600 mt-4 bg-purple-50 px-4 py-2 rounded-lg inline-block border border-purple-200">
          Please select a scenario or enter a custom prompt
        </p>
      )}
    </div>
  );
};

export default RecordingControls;