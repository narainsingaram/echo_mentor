'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisDisplayProps {
  analysis: string;
  isAnalyzing: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isAnalyzing }) => {
  return (
    <div className="relative min-h-[500px] overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Glassmorphic Container */}
      <div className="relative z-10 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8 m-4">
        
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-ping absolute"></div>
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent tracking-tight">
              Neural Analysis Engine
            </h2>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
              {/* Advanced Loading Animation */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-transparent border-t-cyan-400 border-r-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-purple-400 border-l-pink-400 rounded-full animate-spin animate-reverse"></div>
                <div className="absolute inset-4 w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Processing Neural Patterns
                </p>
                <p className="text-sm text-white/60 tracking-wide">
                  Analyzing speech dynamics and presentation flow...
                </p>
              </div>

              {/* Animated Bars */}
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-pulse"
                    style={{
                      height: `${20 + (i * 10)}px`,
                      animationDelay: `${i * 200}ms`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative backdrop-blur-sm bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-inner">
              {analysis ? (
                <div className="prose prose-invert prose-xl max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({children}) => (
                        <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6 tracking-tight">
                          {children}
                        </h1>
                      ),
                      h2: ({children}) => (
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent mb-4 mt-8">
                          {children}
                        </h2>
                      ),
                      h3: ({children}) => (
                        <h3 className="text-xl font-semibold text-cyan-200 mb-3 mt-6">
                          {children}
                        </h3>
                      ),
                      p: ({children}) => (
                        <p className="text-white/90 leading-relaxed mb-4 text-base">
                          {children}
                        </p>
                      ),
                      strong: ({children}) => (
                        <strong className="font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                          {children}
                        </strong>
                      ),
                      em: ({children}) => (
                        <em className="italic text-purple-300">
                          {children}
                        </em>
                      ),
                      ul: ({children}) => (
                        <ul className="space-y-2 mb-4">
                          {children}
                        </ul>
                      ),
                      ol: ({children}) => (
                        <ol className="space-y-2 mb-4 list-decimal list-inside">
                          {children}
                        </ol>
                      ),
                      li: ({children}) => (
                        <li className="text-white/90 flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{children}</span>
                        </li>
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-gradient-to-b from-cyan-400 to-purple-400 pl-6 py-2 bg-white/[0.02] rounded-r-lg my-4">
                          <div className="text-white/80 italic">
                            {children}
                          </div>
                        </blockquote>
                      ),
                      code: ({children}) => (
                        <code className="bg-black/30 text-cyan-300 px-2 py-1 rounded text-sm font-mono border border-white/10">
                          {children}
                        </code>
                      ),
                      pre: ({children}) => (
                        <pre className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto my-4">
                          {children}
                        </pre>
                      )
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-16 space-y-6">
                  {/* Animated Icon */}
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full animate-pulse delay-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">🧠</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-semibold bg-gradient-to-r from-white/80 to-white/60 bg-clip-text text-transparent">
                      Neural Network Ready
                    </p>
                    <p className="text-white/50 text-sm tracking-wide">
                      Your AI-powered presentation analysis will materialize here
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="flex justify-center space-x-4 pt-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-bounce"
                        style={{animationDelay: `${i * 200}ms`}}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;