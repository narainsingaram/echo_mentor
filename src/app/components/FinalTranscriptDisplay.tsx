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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
        Final Transcript
      </h2>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 min-h-[200px] max-h-[400px] overflow-y-auto">
        <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
          {highlightTranscript(transcript) || (
            <span className="text-gray-400 italic">Your transcript will appear here after recording...</span>
          )}
        </div>
        {transcript && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
              <div>
                <h4 className="font-bold text-red-800">Filler Words Detected</h4>
                <p className="text-red-700">
                  <span className="text-2xl font-bold">{countFillerWords(transcript)}</span> filler words found
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalTranscriptDisplay;