'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaStar, FaListAlt, FaInfoCircle, FaFileAlt } from 'react-icons/fa';

// --- Utility: Animated Score Ring ---
const ScoreRing: React.FC<{ score?: number; label: string; from: string; to: string }> = ({
  score = 0,
  label,
  from,
  to,
}) => {
  const radius = 40;
  const stroke = 8;
  const normalizedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={100} className="mb-2">
        <circle
          cx={50}
          cy={50}
          r={radius}
          stroke="#222"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={50}
          cy={50}
          r={radius}
          stroke={`url(#${label}-gradient)`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id={`${label}-gradient`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontSize="1.4rem"
          fill="white"
          fontWeight="bold"
        >
          {normalizedScore}
        </text>
      </svg>
      <span className="text-sm text-white/80 font-medium">{label}</span>
    </div>
  );
};

// --- Main Component ---
interface AnalysisDisplayProps {
  analysis: string;
  isAnalyzing: boolean;
}

interface Scores {
  overall_performance?: number;
  confidence?: number;
  clarity?: number;
  engagement?: number;
  fluency?: number;
  tone?: number;
  body_language?: number;
  vocabulary?: number;
}

interface AnalysisData {
  scores: Scores | null;
  summary_text: string | null;
}

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

const TABS = [
  { key: 'scores', label: 'Scores', icon: <FaStar /> },
  { key: 'details', label: 'Details', icon: <FaListAlt /> },
  { key: 'summary', label: 'Summary', icon: <FaInfoCircle /> },
  { key: 'fullAnalysis', label: 'Full Analysis', icon: <FaFileAlt /> },
] as const;

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isAnalyzing }) => {
  const [data, setData] = useState<AnalysisData>({ scores: null, summary_text: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('scores');

  useEffect(() => {
    if (!analysis) {
      setData({ scores: null, summary_text: null });
      return;
    }

    setLoading(true);
    setError(null);

    const prompt = `
Given the following analysis text, provide a JSON object with the following keys and values:

Scores (0 to 100):
- overall_performance
- confidence
- clarity
- engagement
- fluency
- tone
- body_language
- vocabulary

Summary:
- summary_text: a concise 2-3 sentence summary of the analysis

Respond ONLY with a JSON object like:

{
  "overall_performance": 80,
  "confidence": 75,
  "clarity": 78,
  "engagement": 82,
  "fluency": 70,
  "tone": 85,
  "body_language": 65,
  "vocabulary": 90,
  "summary_text": "Your concise summary here."
}

Analysis text:
"""
${analysis}
"""
`;

    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-3.2-24b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 300,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`OpenRouter error: ${res.statusText}`);
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content || '';

        // Extract JSON substring
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('No JSON found in response');

        const jsonStr = content.slice(start, end + 1);
        const parsed = JSON.parse(jsonStr);

        // Clamp and sanitize numeric scores
        const cleanScores: Scores = {};
        [
          'overall_performance',
          'confidence',
          'clarity',
          'engagement',
          'fluency',
          'tone',
          'body_language',
          'vocabulary',
        ].forEach((key) => {
          const val = parsed[key];
          cleanScores[key as keyof Scores] =
            typeof val === 'number' ? Math.min(100, Math.max(0, val)) : 0;
        });

        setData({
          scores: cleanScores,
          summary_text: typeof parsed.summary_text === 'string' ? parsed.summary_text : null,
        });
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        setData({ scores: null, summary_text: null });
      })
      .finally(() => setLoading(false));
  }, [analysis]);

  // --- Loading/Analyzing State ---
  if (isAnalyzing) {
    return (
      <div className="relative min-h-[420px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-10 max-w-4xl mx-auto shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-cyan-400 border-opacity-80 mb-4" />
          <p className="text-white text-xl font-semibold">Analyzing presentation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 max-w-4xl mx-auto my-10 shadow-2xl border border-white/10">
      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-5 py-2 rounded-full font-semibold text-lg transition-all
            ${activeTab === tab.key
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            <span className="mr-2 text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-400 border-opacity-80 mb-4" />
            <p className="text-white">Loading data…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-10">
            <p className="text-red-400 font-semibold text-lg">Error: {error}</p>
          </div>
        ) : activeTab === 'scores' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 justify-items-center">
            <ScoreRing
              score={data.scores?.overall_performance}
              label="Overall"
              from="#06b6d4"
              to="#a21caf"
            />
            <ScoreRing
              score={data.scores?.confidence}
              label="Confidence"
              from="#14b8a6"
              to="#2563eb"
            />
            <ScoreRing
              score={data.scores?.clarity}
              label="Clarity"
              from="#6366f1"
              to="#d946ef"
            />
            <ScoreRing
              score={data.scores?.engagement}
              label="Engagement"
              from="#ec4899"
              to="#ef4444"
            />
          </div>
        ) : activeTab === 'details' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 justify-items-center">
            <ScoreRing
              score={data.scores?.fluency}
              label="Fluency"
              from="#22d3ee"
              to="#14b8a6"
            />
            <ScoreRing
              score={data.scores?.tone}
              label="Tone"
              from="#fde68a"
              to="#f59e42"
            />
            <ScoreRing
              score={data.scores?.body_language}
              label="Body Language"
              from="#a78bfa"
              to="#f472b6"
            />
            <ScoreRing
              score={data.scores?.vocabulary}
              label="Vocabulary"
              from="#60a5fa"
              to="#818cf8"
            />
          </div>
        ) : activeTab === 'summary' ? (
          <div className="bg-white/10 rounded-2xl p-8 max-w-xl mx-auto text-white shadow-lg flex flex-col items-center">
            <FaInfoCircle className="text-cyan-400 text-4xl mb-2" />
            {data.summary_text ? (
              <p className="text-lg font-medium text-center">{data.summary_text}</p>
            ) : (
              <p className="text-white/70">No summary available.</p>
            )}
          </div>
        ) : (
          <div className="prose prose-invert prose-lg max-w-none text-white bg-white/5 rounded-xl p-6 shadow">
            <ReactMarkdown>{analysis || 'No analysis provided.'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDisplay;
