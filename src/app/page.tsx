'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Import new components
import PracticeModeSelector from './components/PracticeModeSelector';
import ScenarioSelector from './components/ScenarioSelector';
import RecordingControls from './components/RecordingControls';
import CameraPreview from './components/CameraPreview';
import LiveTranscriptDisplay from './components/LiveTranscriptDisplay';
import AudioPlayback from './components/AudioPlayback';
import FinalTranscriptDisplay from './components/FinalTranscriptDisplay';
import DetectedPausesDisplay from './components/DetectedPausesDisplay';
import AnalysisDisplay from './components/AnalysisDisplay';

const PaceVolumeChart = dynamic(() => import('./components/PaceVolumeChart'), { ssr: false });

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

  // Word Categories
  const fillerWords = useMemo(() => ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'I mean', 'right', 'okay'], []);
  const positiveWords = useMemo(() => ['excellent', 'great', 'fantastic', 'confident', 'strong', 'clearly', 'effective', 'beneficial', 'advantage', 'succeeded', 'achieved'], []);
  const weakeningWords = useMemo(() => ['just', 'maybe', 'I think', 'sort of', 'kind of', 'perhaps', 'possibly', 'could be', 'might be', 'I guess'], []);

  // Highlight all types of words
  const highlightTranscript = useCallback((text: string | null) => {
    if (!text) return null;

    const words = text.split(/\b/);

    return words.map((word, index) => {
      const lowerCaseWord = word.toLowerCase();
      if (fillerWords.includes(lowerCaseWord)) {
        return (
          <mark key={index} style={{ backgroundColor: '#FFD700', fontWeight: 'bold', borderRadius: '3px', padding: '0 2px' }}>
            {word}
          </mark>
        );
      } else if (positiveWords.includes(lowerCaseWord)) {
        return (
          <mark key={index} style={{ backgroundColor: '#90EE90', fontWeight: 'bold', borderRadius: '3px', padding: '0 2px' }}>
            {word}
          </mark>
        );
      } else if (weakeningWords.includes(lowerCaseWord)) {
        return (
          <mark key={index} style={{ backgroundColor: '#ADD8E6', fontWeight: 'bold', borderRadius: '3px', padding: '0 2px' }}>
            {word}
          </mark>
        );
      } else {
        return word;
      }
    });
  }, [fillerWords, positiveWords, weakeningWords]);

  // Count filler words
  const countFillerWords = useCallback((text: string) => {
    if (!text) return 0;
    const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }, [fillerWords]);

  // Analyze transcript with Deepseek model
  const analyzeTranscript = useCallback(async (text: string) => {
    const apiKey = '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';
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    let prompt = `
Analyze the following transcript of a presentation and provide constructive feedback on these points:
- **Use of filler words or hesitation**: Identify specific instances and suggest alternatives.
- **Clarity and pacing**: Comment on how easy it was to understand the message and the natural flow of speech.
- **Engagement and tone**: Assess the speaker's ability to maintain audience interest and the overall emotional quality of the speech.
- **Use of strong/positive language**: Identify instances where the speaker used confident or impactful language.
- **Use of weakening language**: Point out phrases that might diminish confidence or assertiveness.
- **Overall presentation strengths and areas to improve**: Summarize the key takeaways.
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
  }, [currentPrompt, practiceMode]);

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
      setAudioURL(null);

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
        const silenceThreshold = 0.02;
        const minSilenceDuration = 0.7;

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
        const words = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
        const currentWordsInInterval = words - lastWordCount;
        const wpm = currentWordsInInterval * 120;

        setLastWordCount(words);

        setPaceData(prev => [...prev, { time: now, wpm: wpm > 0 ? wpm : 0 }]);
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

        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

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
        setCurrentPrompt(customPromptInput);
        break;
      default:
        setCurrentPrompt('');
        setCustomPromptInput('');
        break;
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPromptInput(e.target.value);
    setCurrentPrompt(e.target.value);
  };

  const resetAllStates = () => {
    setTranscript('');
    setLiveTranscript('');
    setAnalysis('');
    setIsAnalyzing(false);
    setRecording(false);
    setPauses([]);
    setCameraStream(null);
    setAudioURL(null);
    setPaceData([]);
    setVolumeData([]);
    setLastWordCount(0);
    setCurrentPrompt('');
    setCustomPromptInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDgwIDAgTCAwIDAgMCA4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full"></div>
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-400 rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 backdrop-blur-xl bg-black/10 border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl">
                <span className="text-4xl">🧠</span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
                EchoMentor
              </h1>
              <p className="text-white/70 text-xl font-medium tracking-wide">
                Advanced AI-powered communication/presentation enhancement app
              </p>
            </div>
            
            {/* Creator Badge */}
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl backdrop-blur-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-200 font-semibold tracking-wide">
                Created by Narain Singaram
              </span>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-500"></div>
            </div>
            
            {/* Animated Divider */}
            <div className="flex justify-center pt-4">
              <div className="w-40 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Practice Mode Selection */}
        <PracticeModeSelector
          practiceMode={practiceMode}
          setPracticeMode={setPracticeMode}
          recording={recording}
          resetAllStates={resetAllStates}
        />

        {/* Scenario Selection */}
        {practiceMode === 'scenario' && (
          <ScenarioSelector
            currentPrompt={currentPrompt}
            customPromptInput={customPromptInput}
            handleScenarioChange={handleScenarioChange}
            handleCustomPromptChange={handleCustomPromptChange}
            recording={recording}
          />
        )}

        {/* Recording Control */}
        <RecordingControls
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          practiceMode={practiceMode}
          currentPrompt={currentPrompt}
          customPromptInput={customPromptInput}
        />

        {/* Live Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Preview */}
          {cameraStream && <CameraPreview videoRef={videoRef} />}

          {/* Live Transcript */}
          {recording && (
            <LiveTranscriptDisplay
              liveTranscript={liveTranscript}
              highlightTranscript={highlightTranscript}
            />
          )}
        </div>

        {/* Audio Playback */}
        {audioURL && <AudioPlayback audioURL={audioURL} />}

        {/* Pace & Volume Visualization */}
        {(recording || paceData.length > 0 || volumeData.length > 0) && (
          <div className="relative overflow-hidden p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-teal-950/90 to-cyan-950/90 rounded-3xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cG9seWdvbiBpZD0idHJpIiBwb2ludHM9IjIwLDAgNDAsNDAgMCw0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvZGVmcz48dXNlIGhyZWY9IiN0cmkiLz48L3N2Zz4=')] opacity-30"></div>
            </div>
            
            <div className="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  Neural Pattern Analytics
                </h2>
              </div>
              
              <div className="bg-black/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <PaceVolumeChart paceData={paceData} volumeData={volumeData} />
                <div className="flex items-center justify-center space-x-8 mt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 font-medium tracking-wide">Speech Velocity</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse delay-300"></div>
                    <span className="text-white/80 font-medium tracking-wide">Audio Amplitude</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Transcript */}
          <FinalTranscriptDisplay
            transcript={transcript}
            highlightTranscript={highlightTranscript}
            countFillerWords={countFillerWords}
          />

          {/* Pauses */}
          <DetectedPausesDisplay pauses={pauses} />
        </div>

        {/* Analysis */}
        <AnalysisDisplay analysis={analysis} isAnalyzing={isAnalyzing} />
      </div>
    </div>
  );
}