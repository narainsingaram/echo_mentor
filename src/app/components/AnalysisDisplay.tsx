'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisDisplayProps {
  analysis: string;
  isAnalyzing: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isAnalyzing }) => {
  return (
    <div className="relative min-h-[600px] overflow-hidden bg-black/90 rounded-3xl">
      {/* Background Grid + Animated Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:32px_32px]"></div>

        {/* Pulsing Aura Effects */}
        <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-fuchsia-500/40 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-cyan-400/20 opacity-10 blur-2xl rounded-full animate-pulse"></div>
        <div className="absolute top-[40%] right-[25%] w-40 h-40 bg-indigo-500 opacity-30 blur-2xl rounded-full animate-ping"></div>
      </div>

      {/* Foreground Glass Container */}
      <div className="relative z-10 rounded-[2rem] p-10 m-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 animate-ping absolute"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-blue-500"></div>
          </div>
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent animate-text-glow">
            AI-Powered Insight
          </h2>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent mb-8"></div>

        {/* Dynamic Content */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center space-y-10 py-20 text-center">
            {/* Animated Core */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-transparent border-t-teal-400 border-r-cyan-400 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-b-purple-400 border-l-pink-400 rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-4 bg-gradient-to-tr from-cyan-400 to-pink-400 rounded-full animate-pulse"></div>
            </div>

            <div>
              <p className="text-2xl font-semibold bg-gradient-to-r from-cyan-200 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Decoding Presentation Flow
              </p>
              <p className="text-sm text-white/60 mt-1">
                Synchronizing with neural rhythm & voice dynamics...
              </p>
            </div>

            {/* Audio Bars */}
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-teal-400 to-indigo-400 animate-pulse"
                  style={{
                    height: `${30 + i * 10}px`,
                    animationDelay: `${i * 150}ms`
                  }}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-lg max-w-none">
            {analysis ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-200 to-cyan-200 bg-clip-text text-transparent mt-10 mb-4">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="text-white/90 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-extrabold text-slate-200">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-300">
                      {children}
                    </em>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className="mt-2 w-1.5 h-1.5 bg-slate-500 rounded-full flex-shrink-0"></span>
                      <span className='text-white/90'>{children}</span>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 pl-4 my-4 border-cyan-400 bg-white/[0.02] rounded-r-xl text-white/80 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-black/40 text-cyan-200 px-2 py-1 rounded font-mono text-sm border border-white/10">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-black/70 text-white p-4 rounded-xl overflow-x-auto border border-white/10">
                      {children}
                    </pre>
                  )
                }}
              >
                {analysis}
              </ReactMarkdown>
            ) : (
              <div className="text-center py-24 space-y-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 to-purple-400/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-cyan-500/50 to-purple-500/50 rounded-full animate-pulse delay-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🧠
                  </div>
                </div>
                <p className="text-2xl font-semibold bg-gradient-to-r from-white/80 to-white/60 bg-clip-text text-transparent">
                  Ready for Thought Analysis
                </p>
                <p className="text-white/50 text-sm tracking-wide">
                  Start speaking or upload content to unlock AI feedback
                </p>

                <div className="flex justify-center space-x-3 pt-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-gradient-to-br from-cyan-300 to-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 200}ms` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDisplay;
