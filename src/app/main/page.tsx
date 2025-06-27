'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Import components
import PracticeModeSelector from '../components/PracticeModeSelector';
import ScenarioSelector from '../components/ScenarioSelector';
import RecordingControls from '../components/RecordingControls';
import CameraPreview from '../components/CameraPreview';
import LiveTranscriptDisplay from '../components/LiveTranscriptDisplay';
import AudioPlayback from '../components/AudioPlayback';
import FinalTranscriptDisplay from '../components/FinalTranscriptDisplay';
import DetectedPausesDisplay from '../components/DetectedPausesDisplay';
import AnalysisDisplay from '../components/AnalysisDisplay';
import LoginButton from "../components/LoginButton";

const PaceVolumeChart = dynamic(() => import('../components/PaceVolumeChart'), { ssr: false });

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- ALL REACT HOOKS MUST BE DECLARED HERE, UNCONDITIONALLY ---
  const [transcript, setTranscript] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [pauses, setPauses] = useState<{ start: number; end: number }[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [paceData, setPaceData] = useState<{ time: number; wpm: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ time: number; rms: number }[]>([]);
  const [practiceMode, setPracticeMode] = useState<'free' | 'scenario' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [customPromptInput, setCustomPromptInput] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'select' | 'record' | 'loading' | 'results'>('select');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const paceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastWordCount, setLastWordCount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
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
      setAnalysis(data.choices?.[0]?.message?.content ?? 'API is currently overloaded.');
    } catch (err) {
      console.error('Error analyzing transcript:', err);
      setAnalysis('Failed to analyze transcript.');
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('results'); // Move to results only after analysis is complete
    }
  }, [currentPrompt, practiceMode]);

  // Set camera stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Cleanup audio URL and other resources
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (paceIntervalRef.current) clearInterval(paceIntervalRef.current);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioURL]);

  // Start recording
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
        setCurrentStep('loading'); // Move to loading step before analysis
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
    setCurrentStep('select');
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Navigation handlers
  const goToRecording = () => {
    if (practiceMode && (practiceMode === 'free' || currentPrompt)) {
      setCurrentStep('record');
    } else {
      alert('Please select a practice mode and, if applicable, a scenario or custom prompt.');
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
  >
    <AppSidebar variant="inset" />
    <SidebarInset>
    <div className="min-h-screen rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDgwIDAgTCAwIDAgMCA4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="backdrop-blur-xl bg-black/10 border-b border-white/10 sticky top-0 py-4">
          <div className="text-center space-y-2">
          </div>
        </header>

        <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Premium</Badge>
              <h2 className="text-3xl font-bold">👋 Welcome to EchoMentor, {session.user?.name?.split(" ")[0]}</h2>
              <p className="max-w-[600px] text-white/80">
                Practice your presentation and speaking capabilities with <b>🧠 EchoMentor</b>. <br></br>Get personalized feedback on your communication skills and improve your presentation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                  Explore Below
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="relative h-40 w-40"
              >
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 rounded-full bg-white/50" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

        {/* Main App Sections */}
        <main className="space-y-8 py-8">
          {/* Step 1: Scenario Selection */}
          {currentStep === 'select' && (
            <section className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white/90">Practice Settings</h2>
              <div className="space-y-4">
                <PracticeModeSelector
                  practiceMode={practiceMode}
                  setPracticeMode={setPracticeMode}
                  recording={recording}
                  resetAllStates={resetAllStates}
                />
                {practiceMode === 'scenario' && (
                  <ScenarioSelector
                    currentPrompt={currentPrompt}
                    customPromptInput={customPromptInput}
                    handleScenarioChange={handleScenarioChange}
                    handleCustomPromptChange={handleCustomPromptChange}
                    recording={recording}
                  />
                )}
              </div>
              <button
                onClick={goToRecording}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors"
              >
                Next: Start Recording
              </button>
            </section>
          )}

          {/* Step 2: Recording */}
          {currentStep === 'record' && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-white/90">Live Feedback</h2>
              <RecordingControls
                recording={recording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                practiceMode={practiceMode}
                currentPrompt={currentPrompt}
                customPromptInput={customPromptInput}
              />
              <div className="grid md:grid-cols-2 gap-6">
                {cameraStream && <CameraPreview videoRef={videoRef} />}
                {recording && (
                  <LiveTranscriptDisplay
                    liveTranscript={liveTranscript}
                    highlightTranscript={highlightTranscript}
                  />
                )}
              </div>
            </section>
          )}

          {/* Step 3: Loading */}
          {currentStep === 'loading' && (
            <section className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6 text-center">
              <h2 className="text-xl font-semibold text-white/90">Processing Analysis</h2>
              <div className="flex justify-center items-center space-x-3">
                <div className="w-8 h-8 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin"></div>
                <p className="text-white/80 text-lg">Analyzing your speech... Please wait.</p>
              </div>
            </section>
          )}

          {/* Step 4: Results */}
          {currentStep === 'results' && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-white/90">Analysis Results</h2>
              {audioURL && <AudioPlayback audioURL={audioURL} />}
              {(paceData.length > 0 || volumeData.length > 0) && (
                <div className="bg-gradient-to-br from-emerald-950/50 to-cyan-950/50 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-semibold text-white/90">Speech Analytics</h2>
                  </div>
                  <PaceVolumeChart paceData={paceData} volumeData={volumeData} />
                  <div className="flex justify-center space-x-8 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-white/80 text-sm">Speech Pace</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse delay-300"></div>
                      <span className="text-white/80 text-sm">Volume Level</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <FinalTranscriptDisplay
                  transcript={transcript}
                  highlightTranscript={highlightTranscript}
                  countFillerWords={countFillerWords}
                />
                <DetectedPausesDisplay pauses={pauses} />
              </div>
              <AnalysisDisplay analysis={analysis} isAnalyzing={isAnalyzing} />
              <div className="flex space-x-4">
                <button
                  onClick={resetAllStates}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
    </SidebarInset>
    </SidebarProvider>
  );
}