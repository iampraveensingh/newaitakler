import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioWaveformPlayer({ audioUrl, duration, compact = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setTotalDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const bars = compact ? 20 : 30;

  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1' : 'py-2'}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-violet-500/20 hover:bg-violet-500/40 border border-violet-500/30 flex items-center justify-center text-violet-400 hover:text-violet-300 transition-all flex-shrink-0"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Waveform bars + seekbar */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="relative h-7 flex items-center gap-px cursor-pointer"
          onClick={seek}
        >
          {[...Array(bars)].map((_, i) => {
            const heightPct = 30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.3) * 15;
            const filled = (i / bars) * 100 <= progress;
            return (
              <motion.div
                key={i}
                animate={playing && filled ? { scaleY: [1, 1.4, 1] } : { scaleY: 1 }}
                transition={{ duration: 0.4, repeat: playing && filled ? Infinity : 0, delay: i * 0.02 }}
                className={`flex-1 rounded-full transition-colors duration-150 ${filled ? 'bg-violet-500' : 'bg-slate-700'}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>
        {!compact && (
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        )}
      </div>

      {compact && (
        <span className="text-[10px] text-slate-500 flex-shrink-0">
          {formatTime(currentTime)}/{formatTime(totalDuration)}
        </span>
      )}
    </div>
  );
}
