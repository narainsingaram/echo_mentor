'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PaceVolumeChart = dynamic(() => import('./PaceVolumeChart'), { ssr: false });

export default function Home() {
  const [transcript, setTranscript] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [pauses, setPauses] = useState<{ start: number; end: number }[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  // New states for pace & volume
  const [paceData, setPaceData] = useState<{ time: number; wpm: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ time: number; rms: number }[]>([]);

  // New states for practice modes
  const [practiceMode, setPracticeMode] = useState<'free' | 'scenario' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [customPromptInput, setCustomPromptInput] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // For pace/volume interval
  const paceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastWordCount, setLastWordCount] = useState(0);

  // Pause detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Speech recognition refs
  const recognitionRef = useRef<any>(null);

  // Filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually'];

  // Highlight filler words
  const highlightFillerWords = (text: string) => {
    if (!text) return null;
    const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (fillerWords.some(fw => fw.toLowerCase() === part.toLowerCase())) {
        return (
          <mark key={index} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
            {part}
          </mark>
        );
      } else {
        return part;
      }
    });
  };

  // Count filler words
  const countFillerWords = (text: string) => {
    if (!text) return 0;
    const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  };

  // Analyze transcript with Deepseek model
  const analyzeTranscript = async (text: string) => {
    const apiKey = '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';
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    let prompt = `
Analyze the following transcript of a presentation and provide constructive feedback on these points:
- Use of filler words or hesitation
- Clarity and pacing
- Engagement and tone
- Overall presentation strengths and areas to improve
`;

    if (practiceMode === 'scenario' && currentPrompt) {
      prompt += `

**Consider the following scenario/prompt for your analysis:**
Prompt: "${currentPrompt}"
`;
    } else if (practiceMode === 'free') {
      prompt += `

**This was a free speech practice session, so provide general feedback.**
`;
    }

    prompt += `
Transcript:
"""${text}"""
    `;

    setIsAnalyzing(true);
    setAnalysis('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      setAnalysis(data.choices?.[0]?.message?.content ?? 'No analysis received.');
    } catch (err) {
      console.error('Error analyzing transcript:', err);
      setAnalysis('Failed to analyze transcript.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Set camera stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Cleanup audio URL on component unmount or new recording
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (paceIntervalRef.current) clearInterval(paceIntervalRef.current);
    };
  }, [audioURL]);

  // Start recording: audio for recording, video for preview only
  const startRecording = async () => {
    try {
      setPauses([]);
      setLiveTranscript('');
      setTranscript('');
      setAnalysis('');
      setPaceData([]);
      setVolumeData([]);
      setLastWordCount(0);
      setAudioURL(null); // Clear previous audio

      // Audio and video streams
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

      setCameraStream(videoStream);

      // --- Pause Detection Setup ---
      audioContextRef.current = new window.AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(audioStream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      const dataArray = new Uint8Array(analyserRef.current.fftSize);

      let silenceStart: number | null = null;
      let lastPauseEnd = 0;
      startTimeRef.current = audioContextRef.current.currentTime;

      let lastRms = 0;

      const checkSilence = () => {
        if (!analyserRef.current || !audioContextRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        lastRms = rms;

        const now = audioContextRef.current.currentTime - startTimeRef.current;
        const silenceThreshold = 0.02; // tweak as needed
        const minSilenceDuration = 0.7; // seconds

        if (rms < silenceThreshold) {
          if (silenceStart === null) {
            silenceStart = now;
          } else if (now - silenceStart > minSilenceDuration && lastPauseEnd < silenceStart) {
            if (typeof silenceStart === 'number' && typeof now === 'number') {
              setPauses(prev => [...prev, { start: silenceStart, end: now }]);
              lastPauseEnd = now;
            }
            silenceStart = null;
          }
        } else {
          silenceStart = null;
        }
        silenceTimeoutRef.current = setTimeout(checkSilence, 100);
      };
      checkSilence();

      // --- Real-Time Transcription Setup ---
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }
          setLiveTranscript(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      // --- Pace & Volume Data Collection ---
      paceIntervalRef.current = setInterval(() => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime - startTimeRef.current;
        // WPM calculation
        const words = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
        const wpm = (words - lastWordCount) * 120; // 0.5s interval, so *120 for per minute
        setLastWordCount(words);

        setPaceData(prev => [...prev, { time: now, wpm }]);
        setVolumeData(prev => [...prev, { time: now, rms: lastRms }]);
      }, 500);

      // --- Audio Recording Setup ---
      const mediaRecorder = new MediaRecorder(audioStream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        videoStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);

        // Clean up pause detection
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        if (paceIntervalRef.current) {
          clearInterval(paceIntervalRef.current);
        }

        // Stop speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Upload audio to backend for transcription
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        const res = await fetch('http://localhost:3001/transcribe', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        setTranscript(data.transcript);

        await analyzeTranscript(data.transcript);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone or camera:', error);
      alert('Error accessing microphone or camera. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedScenario = e.target.value;
    switch (selectedScenario) {
      case 'job_interview':
        setCurrentPrompt('Introduce yourself and explain why you are a good fit for a software engineering role at a tech company.');
        setCustomPromptInput('');
        break;
      case 'sales_pitch':
        setCurrentPrompt('Deliver a 2-minute pitch for a new productivity app, highlighting its key benefits.');
        setCustomPromptInput('');
        break;
      case 'academic_presentation':
        setCurrentPrompt('Present a summary of a recent research paper in your field, including its findings and implications.');
        setCustomPromptInput('');
        break;
      case 'public_speaking':
        setCurrentPrompt('Give a short motivational speech on the importance of perseverance.');
        setCustomPromptInput('');
        break;
      case 'custom':
        setCurrentPrompt(customPromptInput); // Use the custom input directly
        break;
      default:
        setCurrentPrompt('');
        setCustomPromptInput('');
        break;
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPromptInput(e.target.value);
    setCurrentPrompt(e.target.value); // Update currentPrompt as user types custom prompt
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  {/* Header Section */}
  <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm sticky top-0 z-10">
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <span className="text-2xl">🎤</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
          AI Speech Transcriber & Analysis
        </h1>
        <p className="text-gray-600 text-lg font-medium">
          Practice your speaking skills with real-time feedback and analysis
        </p>
      </div>
    </div>
  </div>

  <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
    {/* Practice Mode Selection */}
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Practice Mode</h2>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          className={`group relative overflow-hidden p-6 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
            practiceMode === 'free' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
          onClick={() => {
            setPracticeMode('free');
            setCurrentPrompt('');
            setCustomPromptInput('');
            setTranscript('');
            setLiveTranscript('');
            setAnalysis('');
            setPauses([]);
            setPaceData([]);
            setVolumeData([]);
            setAudioURL(null);
          }}
          disabled={recording}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-lg font-bold mb-1">Free Speech Mode</div>
            <div className="text-blue-100 text-sm">Practice without constraints</div>
          </div>
        </button>

        <button
          className={`group relative overflow-hidden p-6 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
            practiceMode === 'scenario' 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-purple-500/25' 
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
          onClick={() => {
            setPracticeMode('scenario');
            setCurrentPrompt('');
            setCustomPromptInput('');
            setTranscript('');
            setLiveTranscript('');
            setAnalysis('');
            setPauses([]);
            setPaceData([]);
            setVolumeData([]);
            setAudioURL(null);
          }}
          disabled={recording}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-lg font-bold mb-1">Practice Scenarios</div>
            <div className="text-purple-100 text-sm">Guided practice sessions</div>
          </div>
        </button>
      </div>
    </div>

    {/* Scenario Selection */}
    {practiceMode === 'scenario' && (
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

          {currentPrompt && currentPrompt !== customPromptInput && (
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

          {currentPrompt === customPromptInput && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Create Your Custom Prompt</label>
              <textarea
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
    )}

    {/* Recording Control */}
    <div className="text-center">
      <button
        className={`group relative px-12 py-6 rounded-2xl text-white text-2xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 ${
          recording 
            ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse shadow-red-500/30' 
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30'
        } ${!practiceMode && 'opacity-50 cursor-not-allowed hover:scale-100'}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={!practiceMode || (practiceMode === 'scenario' && !currentPrompt && !customPromptInput)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="relative z-10 flex items-center space-x-3">
          <span className="text-3xl">{recording ? '⏹' : '▶'}</span>
          <span>{recording ? 'Stop Recording' : 'Start Recording'}</span>
        </div>
      </button>

      {!practiceMode && (
        <p className="text-gray-500 mt-4 bg-gray-100 px-4 py-2 rounded-lg inline-block">
          Please select a practice mode to begin
        </p>
      )}
      
      {practiceMode === 'scenario' && !currentPrompt && !customPromptInput && (
        <p className="text-purple-600 mt-4 bg-purple-50 px-4 py-2 rounded-lg inline-block border border-purple-200">
          Please select a scenario or enter a custom prompt
        </p>
      )}
    </div>

    {/* Live Content Grid */}
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Camera Preview */}
      {cameraStream && (
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
      )}

      {/* Live Transcript */}
      {recording && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200 p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
            Live Transcript
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 min-h-[200px] max-h-[400px] overflow-y-auto">
            <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
              {highlightFillerWords(liveTranscript) || (
                <span className="text-gray-400 italic">Start speaking to see live transcription...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Audio Playback */}
    {audioURL && (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
          Recorded Audio Playback
        </h2>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <audio controls src={audioURL} className="w-full h-12" />
        </div>
      </div>
    )}

    {/* Pace & Volume Visualization */}
    {recording && (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
          Speech Pace & Volume Analysis
        </h2>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <PaceVolumeChart paceData={paceData} volumeData={volumeData} />
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Words per minute</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Volume level</span>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Results Grid */}
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Transcript */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
          Final Transcript
        </h2>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 min-h-[200px] max-h-[400px] overflow-y-auto">
          <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
            {highlightFillerWords(transcript) || (
              <span className="text-gray-400 italic">Your transcript will appear here after recording...</span>
            )}
          </div>
        </div>
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
      </div>

      {/* Pauses */}
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
    </div>

    {/* Analysis */}
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
  </div>
</div>
  );
}