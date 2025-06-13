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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
        Select Your Scenario
      </h3>

      <div className="space-y-4">
        <select
          className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-gray-700 font-medium"
          onChange={handleScenarioChange}
          disabled={recording}
        >
          <option value="">-- Choose a Scenario --</option>
          <option value="job_interview">💼 Job Interview</option>
          <option value="sales_pitch">📈 Sales Pitch</option>
          <option value="academic_presentation">🎓 Academic Presentation</option>
          <option value="public_speaking">🎤 General Public Speaking</option>
          <option value="custom">✏️ Custom Prompt</option>
        </select>

        {currentPrompt && !isCustomPromptSelected && (
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div>
                <h4 className="font-bold text-purple-800 mb-2">Your Practice Prompt</h4>
                <p className="text-purple-700 leading-relaxed">{currentPrompt}</p>
              </div>
            </div>
          </div>
        )}

        {isCustomPromptSelected && ( // Only show textarea if 'custom' is selected or customPromptInput is already set
          <div className="space-y-3">
            <label htmlFor="custom-prompt" className="block text-sm font-bold text-gray-700">
              Create Your Custom Prompt
            </label>
            <textarea
              id="custom-prompt"
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 resize-none"
              placeholder="Example: Describe your ideal vacation destination and explain why it appeals to you..."
              value={customPromptInput}
              onChange={handleCustomPromptChange}
              rows={4}
              disabled={recording}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioSelector;