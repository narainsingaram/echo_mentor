'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlaybackProps {
  audioURL: string | null;
}

const AudioPlayback: React.FC<AudioPlaybackProps> = ({ audioURL }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [audioURL]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioURL) return null;

  return (
    <div className="relative group max-w-6xl mx-auto transition duration-500 ease-in-out">
      {/* Outer glass shell */}
      <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-3xl bg-gradient-to-br from-black/20 via-black/50 via-black/60 to-black/50 border border-white/10 overflow-hidden relative">
        
        {/* Pulse ring when playing */}
        {isPlaying && (
          <div className="absolute -inset-1 rounded-[2rem] bg-emerald-400/10 blur-xl animate-pulse pointer-events-none" />
        )}

        {/* Header */}
        <h2 className="text-3xl font-black bg-gradient-to-r from-white via-green-200 to-emerald-300 bg-clip-text text-transparent mb-8 tracking-tight">
          🎧 AI-ENHANCED AUDIO PLAYER
        </h2>

        {/* Simulated Waveform */}
        <div className="relative h-24 rounded-2xl border border-white/10 bg-black/30 overflow-hidden mb-8 shadow-inner shadow-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-white/5 to-emerald-400/10" />
          <div className="flex items-end justify-center h-full px-6 space-x-1 animate-[pulse_3s_infinite]">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="rounded-full bg-gradient-to-t from-green-300 to-emerald-400 transition-all"
                style={{
                  width: '4px',
                  height: `${Math.sin(i + currentTime) * 40 + 60}%`,
                  opacity: i < (currentTime / duration) * 48 ? 0.9 : 0.3,
                  filter: i < (currentTime / duration) * 48 ? 'drop-shadow(0 0 4px #34d399)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-6">
          {/* Playback Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Play Button */}
            <button
              onClick={togglePlay}
              className="group relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-400/30 hover:scale-105 transition"
            >
              <div className="text-black text-3xl font-black">
                {isPlaying ? '⏸' : '▶'}
              </div>
              <div className="absolute -inset-1 blur-xl bg-emerald-400 opacity-20 group-hover:opacity-40 rounded-3xl" />
            </button>

            {/* Time Readout */}
            <div className="flex items-center gap-2 font-mono text-white/80 text-lg">
              <span className="px-3 py-1 bg-white/10 rounded-lg border border-white/10">{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span className="px-3 py-1 bg-white/10 rounded-lg border border-white/10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <label className="text-sm text-white/50 font-medium">Progress</label>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full appearance-none h-2 rounded-full bg-white/10 mt-1 slider-thumb-emerald"
              style={{
                background: `linear-gradient(to right, #10b981 ${((currentTime / duration) * 100) || 0}%, #ffffff1a ${((currentTime / duration) * 100) || 0}%)`
              }}
            />
          </div>

          {/* Volume Bar */}
          <div>
            <label className="text-sm text-white/50 font-medium">Volume</label>
            <div className="flex items-center gap-4 mt-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full appearance-none h-2 rounded-full bg-white/10 slider-thumb-emerald"
                style={{
                  background: `linear-gradient(to right, #10b981 ${volume * 100}%, #ffffff1a ${volume * 100}%)`
                }}
              />
              <span className="text-white/60 text-sm font-mono min-w-[40px]">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Audio */}
        <audio ref={audioRef} src={audioURL} preload="metadata" />
      </div>

      <style jsx>{`
        .slider-thumb-emerald::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 8px #10b981aa;
        }

        .slider-thumb-emerald::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 8px #10b981aa;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.9; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AudioPlayback;
