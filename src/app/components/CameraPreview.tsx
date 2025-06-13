'use client';

import React from 'react';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ videoRef }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
        Camera Preview
      </h2>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-auto rounded-xl shadow-lg border-4 border-gray-200"
        />
        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default CameraPreview;