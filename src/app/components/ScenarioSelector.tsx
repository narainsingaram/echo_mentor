'use client';

import React from 'react';

interface ScenarioSelectorProps {
  currentPrompt: string;
  customPromptInput: string;
  handleScenarioChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCustomPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  recording: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  currentPrompt,
  customPromptInput,
  handleScenarioChange,
  handleCustomPromptChange,
  recording,
}) => {
  const isCustomPromptSelected = currentPrompt === customPromptInput;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 opacity-20 blur-2xl bg-gradient-to-r from-purple-600 to-violet-600 rounded-3xl scale-110"></div>
      
      {/* Main container */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-900/85 to-black/70 rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
        {/* Decorative corner elements */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-violet-400 rounded-full opacity-40"></div>
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full mr-4"></div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Select Your Scenario
          </h3>
        </div>

        <div className="space-y-6">
          {/* Enhanced Select */}
          <div className="relative">
            <select
              className={`
                w-full p-5 rounded-2xl font-medium text-white transition-all duration-300
                bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm
                border border-purple-500/30 shadow-lg
                focus:border-purple-400 focus:shadow-purple-500/20 focus:shadow-lg
                hover:border-purple-400/50
                ${recording ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gradient-to-r hover:from-gray-700/80 hover:to-gray-800/80'}
                appearance-none cursor-pointer
              `}
              onChange={handleScenarioChange}
              disabled={recording}
            >
              <option value="" className="bg-gray-800 text-gray-300">-- Choose a Scenario --</option>
              <option value="job_interview" className="bg-gray-800 text-white">💼 Job Interview</option>
              <option value="sales_pitch" className="bg-gray-800 text-white">📈 Sales Pitch</option>
              <option value="academic_presentation" className="bg-gray-800 text-white">🎓 Academic Presentation</option>
              <option value="public_speaking" className="bg-gray-800 text-white">🎤 General Public Speaking</option>
              <option value="custom" className="bg-gray-800 text-white">✏️ Custom Prompt</option>
            </select>
            
            {/* Custom dropdown arrow */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-400"></div>
            </div>
          </div>

          {/* Current Prompt Display */}
          {currentPrompt && !isCustomPromptSelected && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/30 p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-violet-400/5"></div>
              
              <div className="relative flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-purple-200 mb-3 text-lg">Your Practice Prompt</h4>
                  <p className="text-purple-100/90 leading-relaxed">{currentPrompt}</p>
                </div>
              </div>
              
              {/* Decorative line */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
            </div>
          )}

          {/* Custom Prompt Input */}
          {isCustomPromptSelected && (
            <div className="space-y-4">
              <label htmlFor="custom-prompt" className="block text-sm font-bold text-purple-200">
                Create Your Custom Prompt
              </label>
              <div className="relative">
                <textarea
                  id="custom-prompt"
                  className={`
                    w-full p-5 rounded-2xl font-medium text-white transition-all duration-300 resize-none
                    bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm
                    border border-purple-500/30 shadow-lg
                    focus:border-purple-400 focus:shadow-purple-500/20 focus:shadow-lg
                    hover:border-purple-400/50
                    ${recording ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gradient-to-br hover:from-gray-700/80 hover:to-gray-800/80'}
                    placeholder-gray-400
                  `}
                  placeholder="Example: Describe your ideal vacation destination and explain why it appeals to you..."
                  value={customPromptInput}
                  onChange={handleCustomPromptChange}
                  rows={4}
                  disabled={recording}
                />
                
                {/* Character count indicator */}
                <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                  {customPromptInput.length} chars
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute -top-px left-1/3 w-12 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
        <div className="absolute -bottom-px right-1/3 w-16 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"></div>
      </div>
      
      {/* Outer subtle border */}
      <div className="absolute inset-0 rounded-3xl border border-purple-500/10 scale-105 pointer-events-none"></div>
    </div>
  );
};

export default ScenarioSelector;