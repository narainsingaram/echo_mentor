'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Camera related states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio playback URL
  const [audioURL, setAudioURL] = useState<string | null>(null);

  // List of filler words to highlight
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually'];

  // Highlight filler words in transcript text
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

  // Count filler words in the transcript
  const countFillerWords = (text: string) => {
    if (!text) return 0;
    const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  };

  // Analyze transcript with Deepseek model
  const analyzeTranscript = async (text: string) => {
    const apiKey = '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'; // put your key here
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const prompt = `
Analyze the following transcript of a presentation and provide constructive feedback on these points:
- Use of filler words or hesitation
- Clarity and pacing
- Engagement and tone
- Overall presentation strengths and areas to improve

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
    };
  }, [audioURL]);

  // Start recording: audio for recording, video for preview only
  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

      setCameraStream(videoStream);

      const mediaRecorder = new MediaRecorder(audioStream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        videoStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Create playback URL
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
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl mb-4">🎤 AI Speech Transcriber & Analysis</h1>
      <button
        className={`px-4 py-2 rounded text-white ${
          recording ? 'bg-red-600' : 'bg-green-600'
        }`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Camera Preview */}
      {cameraStream && (
        <div className="mt-6 mx-auto" style={{ maxWidth: 320 }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded border"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}

      {/* Audio Playback */}
      {audioURL && (
        <div className="mt-6 max-w-xl mx-auto">
          <h2 className="text-xl font-bold">Recorded Audio Playback:</h2>
          <audio controls src={audioURL} />
        </div>
      )}

      <div className="mt-6 text-left max-w-xl mx-auto">
        <h2 className="text-xl font-bold">Transcript:</h2>
        <p className="mt-2 border p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {highlightFillerWords(transcript)}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Filler words count: <strong>{countFillerWords(transcript)}</strong>
        </p>
      </div>

      <div className="mt-6 text-left max-w-xl mx-auto">
        <h2 className="text-xl font-bold">Presentation Analysis:</h2>
        {isAnalyzing ? (
          <p className="italic text-gray-500">Analyzing...</p>
        ) : (
          <pre className="mt-2 border p-4 bg-yellow-50 rounded whitespace-pre-wrap">{analysis}</pre>
        )}
      </div>
    </div>
  );
}
