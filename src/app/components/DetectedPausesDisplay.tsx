'use client';

import React from 'react';

interface DetectedPausesDisplayProps {
  pauses: { start: number; end: number }[];
}

const DetectedPausesDisplay: React.FC<DetectedPausesDisplayProps> = ({ pauses }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
        Detected Pauses
      </h2>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 min-h-[200px] max-h-[400px] overflow-y-auto">
        {pauses.length > 0 ? (
          <div className="space-y-3">
            {pauses.map((pause, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="text-gray-700 font-medium">Pause detected</span>
                </div>
                <div className="text-right text-sm">
                  <div className="text-blue-600 font-bold">
                    {typeof pause.start === 'number' ? pause.start.toFixed(2) : '0.00'}s - {typeof pause.end === 'number' ? pause.end.toFixed(2) : '0.00'}s
                  </div>
                  <div className="text-gray-500">
                    Duration: {typeof pause.end === 'number' && typeof pause.start === 'number' ? (pause.end - pause.start).toFixed(2) : '0.00'}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏸</span>
            </div>
            <p className="text-gray-500 italic">No significant pauses detected yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectedPausesDisplay;