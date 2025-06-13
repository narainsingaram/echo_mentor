'use client';

import React from 'react';

interface AudioPlaybackProps {
  audioURL: string | null;
}

const AudioPlayback: React.FC<AudioPlaybackProps> = ({ audioURL }) => {
  if (!audioURL) return null;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
        Recorded Audio Playback
      </h2>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <audio controls src={audioURL} className="w-full h-12" />
      </div>
    </div>
  );
};

export default AudioPlayback;