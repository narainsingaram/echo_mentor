'use client';

import React from 'react';

interface AnalysisDisplayProps {
  analysis: string;
  isAnalyzing: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isAnalyzing }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-yellow-200 p-8">
      <h2 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center">
        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-4"></span>
        AI Presentation Analysis
      </h2>

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-yellow-700 font-medium text-lg">Analyzing your speech...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-yellow-200 shadow-inner">
          {analysis ? (
            <pre className="text-gray-800 font-sans leading-relaxed whitespace-pre-wrap">{analysis}</pre>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-gray-500 italic">Your AI analysis will appear here after recording</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;