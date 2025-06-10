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
    <div className="p-10 text-center">
      <h1 className="text-3xl mb-4">🎤 AI Speech Transcriber & Analysis</h1>

      <div className="mb-6">
        <h2 className="text-xl mb-2 font-semibold">Choose Your Practice Mode:</h2>
        <div className="flex justify-center space-x-4">
          <button
            className={`px-6 py-3 rounded-lg text-white font-medium shadow-md transition-colors duration-200 ${
              practiceMode === 'free' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
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
            Free Speech Mode
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-white font-medium shadow-md transition-colors duration-200 ${
              practiceMode === 'scenario' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-500 hover:bg-purple-600'
            }`}
            onClick={() => {
              setPracticeMode('scenario');
              setCurrentPrompt(''); // Clear current prompt
              setCustomPromptInput(''); // Clear custom input
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
            Practice Prompts & Scenarios
          </button>
        </div>
      </div>

      {practiceMode === 'scenario' && (
        <div className="mt-4 mb-6 max-w-xl mx-auto text-left p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-3">Select a Scenario or Enter Your Own:</h3>
          <select
            className="block w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleScenarioChange}
            disabled={recording}
          >
            <option value="">-- Choose a Scenario --</option>
            <option value="job_interview">Job Interview</option>
            <option value="sales_pitch">Sales Pitch</option>
            <option value="academic_presentation">Academic Presentation</option>
            <option value="public_speaking">General Public Speaking</option>
            <option value="custom">Custom Prompt</option>
          </select>

          {currentPrompt && currentPrompt !== customPromptInput && ( // Display pre-defined prompt if not custom
            <p className="p-3 border border-dashed border-gray-400 bg-gray-50 rounded-md text-sm italic">
              <strong className="text-gray-700">Your Prompt:</strong> {currentPrompt}
            </p>
          )}

          {currentPrompt === customPromptInput && ( // Display custom prompt input if custom is selected
            <div className="mt-3">
              <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-1">Enter your custom prompt:</label>
              <textarea
                id="custom-prompt"
                className="block w-full p-2 border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., Describe your ideal vacation."
                value={customPromptInput}
                onChange={handleCustomPromptChange}
                rows={3}
                disabled={recording}
              ></textarea>
            </div>
          )}
        </div>
      )}

      <button
        className={`px-8 py-4 rounded-full text-white text-xl font-bold shadow-lg transition-all duration-300 ${
          recording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'
        } ${!practiceMode && 'opacity-50 cursor-not-allowed'}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={!practiceMode || (practiceMode === 'scenario' && !currentPrompt && !customPromptInput)}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {!practiceMode && <p className="text-sm text-gray-500 mt-2">Please select a practice mode to begin.</p>}
      {practiceMode === 'scenario' && !currentPrompt && !customPromptInput && (
        <p className="text-sm text-gray-500 mt-2">Please select a scenario or enter a custom prompt.</p>
      )}

      {/* Camera Preview */}
      {cameraStream && (
        <div className="mt-8 mx-auto" style={{ maxWidth: 320 }}>
          <h2 className="text-xl font-bold mb-2">Camera Preview:</h2>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg border-2 border-gray-300 shadow-md"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}

      {/* Audio Playback */}
      {audioURL && (
        <div className="mt-8 max-w-xl mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-3">Recorded Audio Playback:</h2>
          <audio controls src={audioURL} className="w-full" />
        </div>
      )}

      {/* Real-time Transcript */}
      {recording && (
        <div className="mt-8 text-left max-w-xl mx-auto p-4 bg-blue-50 rounded-lg shadow-md border border-blue-200">
          <h2 className="text-xl font-bold mb-3 text-blue-800">Live Transcript:</h2>
          <div className="mt-2 border p-4 bg-white rounded-md whitespace-pre-wrap text-gray-800 break-words">
            {highlightFillerWords(liveTranscript)}
          </div>
        </div>
      )}

      {/* Pace & Volume Visualization */}
      {recording && (
        <div className="mt-8 max-w-xl mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-3">Speech Pace & Volume</h2>
          <PaceVolumeChart paceData={paceData} volumeData={volumeData} />
          <div className="text-sm text-gray-500 mt-2">Blue: Words per minute, Orange: Volume</div>
        </div>
      )}

      <div className="mt-8 text-left max-w-xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-3">Transcript:</h2>
        <div className="mt-2 border p-4 bg-white rounded-md whitespace-pre-wrap text-gray-800 break-words">
          {highlightFillerWords(transcript)}
        </div>
        <p className="mt-3 text-base text-gray-700">
          Filler words count: <strong className="text-red-600">{countFillerWords(transcript)}</strong>
        </p>
      </div>

      <div className="mt-8 text-left max-w-xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-3">Detected Pauses:</h2>
        {pauses.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-800">
            {pauses.map((pause, idx) => (
              <li key={idx} className="mb-1">
                Pause from <strong className="text-blue-600">{typeof pause.start === 'number' ? pause.start.toFixed(2) : '0.00'}s</strong> to <strong className="text-blue-600">{typeof pause.end === 'number' ? pause.end.toFixed(2) : '0.00'}s</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-500">No significant pauses detected yet.</p>
        )}
      </div>

      <div className="mt-8 text-left max-w-xl mx-auto p-4 bg-yellow-50 rounded-lg shadow-md border border-yellow-200">
        <h2 className="text-xl font-bold mb-3 text-yellow-800">Presentation Analysis:</h2>
        {isAnalyzing ? (
          <p className="italic text-gray-500">Analyzing...</p>
        ) : (
          <pre className="mt-2 border p-4 bg-white rounded-md whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">{analysis}</pre>
        )}
      </div>
    </div>
  );
}