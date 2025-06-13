'use client';

import React from 'react';

interface LiveTranscriptDisplayProps {
  liveTranscript: string;
  highlightTranscript: (text: string | null) => React.ReactNode;
}

const LiveTranscriptDisplay: React.FC<LiveTranscriptDisplayProps> = ({
  liveTranscript,
  highlightTranscript,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200 p-6">
      <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
        Live Transcript
      </h2>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 min-h-[200px] max-h-[400px] overflow-y-auto">
        <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
          {highlightTranscript(liveTranscript) || (
            <span className="text-gray-400 italic">Start speaking to see live transcription...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranscriptDisplay;