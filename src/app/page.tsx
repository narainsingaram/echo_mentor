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

  // Highlight all types of words - Moved to a utility or kept here if it needs all lists
  // For now, keeping it here as it depends on all three word lists.
  const highlightTranscript = useCallback((text: string | null) => {
    if (!text) return null;

    const words = text.split(/\b/); // Split by word boundaries to keep delimiters

    return words.map((word, index) => {
      const lowerCaseWord = word.toLowerCase();
      if (fillerWords.includes(lowerCaseWord)) {
        return (
          <mark key={index} style={{ backgroundColor: '#FFD700', fontWeight: 'bold', borderRadius: '3px', padding: '0 2px' }}> {/* Gold for filler */}
            {word}
          </mark>
        );
      } else if (positiveWords.includes(lowerCaseWord)) {
        return (
          <mark key={index} style={{ backgroundColor: '#90EE90', fontWeight: 'bold', borderRadius: '3px', padding: '0 2px' }}> {/* Light Green for positive */}
            {word}
          </mark>
        );
      } else if (weakeningWords.includes(lowerCaseWord)) {
        return (
          <mark key={index} style={{ backgroundColor: '#ADD8E6', fontWeight: 'bold', borderRadius: '3px', padding: '0 2px' }}> {/* Light Blue for weakening */}
            {word}
          </mark>
        );
      } else {
        return word;
      }
    });
  }, [fillerWords, positiveWords, weakeningWords]);

  // Count filler words - Moved to a utility or kept here if it needs all lists
  const countFillerWords = useCallback((text: string) => {
    if (!text) return 0;
    const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }, [fillerWords]);

  // Analyze transcript with Deepseek model
  const analyzeTranscript = useCallback(async (text: string) => {
    const apiKey = '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'; // Replace with your actual API key
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
          model: 'deepseek/deepseek-r1-0528-qwen3-8b:free', // Using the specified model
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
        // WPM calculation: words detected in the last 0.5s interval * 120 (to get per minute)
        // This logic is slightly off, as `words` is cumulative. It should be `words - lastWordCount`.
        // Fixing this by getting the difference.
        const currentWordsInInterval = words - lastWordCount;
        const wpm = currentWordsInInterval * 120; // 0.5s interval, so *120 for per minute

        setLastWordCount(words); // Update lastWordCount for the next interval

        setPaceData(prev => [...prev, { time: now, wpm: wpm > 0 ? wpm : 0 }]); // Ensure WPM is not negative
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
            <p className="bg-amber-200 text-amber-800 text-md w-3/5 rounded-2xl m-auto font-bold px-3 py-2 mt-4">Created by: Narain Singaram</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
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
        {(recording || paceData.length > 0 || volumeData.length > 0) && ( // Show chart if recording or data exists
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