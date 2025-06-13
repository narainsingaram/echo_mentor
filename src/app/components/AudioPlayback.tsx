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
    <div className="relative overflow-hidden">

      {/* Main container */}
      <div className="relative backdrop-blur-2xl bg-black/20 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
              {isPlaying && (
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-30 scale-150"></div>
              )}
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent tracking-wide">
              AUDIO PLAYBACK
            </h2>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent"></div>
        </div>

        {/* Audio player container */}
        <div className="relative px-8 pb-8">
          <div className="relative backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/10 pointer-events-none"></div>
            
            <div className="relative p-8 space-y-6">
              {/* Waveform visualization placeholder */}
              <div className="relative h-20 bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/20 to-green-500/10"></div>
                <div className="flex items-end justify-center h-full space-x-1 px-4">
                  {Array.from({ length: 40 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-green-400 to-emerald-300 rounded-full opacity-60"
                      style={{
                        width: '3px',
                        height: `${Math.random() * 60 + 20}%`,
                        filter: i < (currentTime / duration) * 40 ? 'brightness(1.5)' : 'brightness(0.4)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Controls section */}
              <div className="space-y-4">
                {/* Play button and time display */}
                <div className="flex items-center space-x-6">
                  {/* Enhanced play/pause button */}
                  <button
                    onClick={togglePlay}
                    className="relative group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200">
                      <div className="text-black text-2xl font-black">
                        {isPlaying ? '⏸' : '▶'}
                      </div>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-200"></div>
                  </button>

                  {/* Time display */}
                  <div className="flex items-center space-x-3 text-white/90 font-mono text-lg">
                    <span className="bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-white/40">/</span>
                    <span className="bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="text-green-200/60 text-sm font-medium tracking-wide">PROGRESS</div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer slider-thumb-green"
                      style={{
                        background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Volume control */}
                <div className="flex items-center space-x-4">
                  <div className="text-green-200/60 text-sm font-medium tracking-wide min-w-[60px]">VOLUME</div>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer slider-thumb-green"
                      style={{
                        background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                  </div>
                  <div className="text-white/70 font-mono text-sm min-w-[40px]">
                    {Math.round(volume * 100)}%
                  </div>
                </div>
              </div>

              {/* Hidden audio element */}
              <audio ref={audioRef} src={audioURL} preload="metadata" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb-green::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, rgb(34 197 94), rgb(16 185 129));
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .slider-thumb-green::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, rgb(34 197 94), rgb(16 185 129));
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AudioPlayback;