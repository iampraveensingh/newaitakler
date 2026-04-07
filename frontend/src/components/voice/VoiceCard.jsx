import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBarHeights } from '@/components/audio/AudioWaveformPlayer';

const voiceCategories = {
  'conversational': { emoji: '💬', label: 'Conversational', color: 'from-sky-500 to-blue-500',       badge: 'bg-sky-500/15 text-sky-300 border-sky-500/25'        },
  'narration':      { emoji: '📖', label: 'Narration',      color: 'from-teal-500 to-emerald-500',   badge: 'bg-teal-500/15 text-teal-300 border-teal-500/25'     },
  'characters':     { emoji: '🎭', label: 'Characters',     color: 'from-purple-500 to-pink-500',    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/25'},
  'social_media':   { emoji: '📱', label: 'Social Media',   color: 'from-rose-500 to-orange-500',    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25'      },
  'educational':    { emoji: '🎓', label: 'Educational',    color: 'from-green-500 to-teal-500',     badge: 'bg-green-500/15 text-green-300 border-green-500/25'   },
  'advertisement':  { emoji: '📢', label: 'Advertisement',  color: 'from-orange-500 to-amber-500',   badge: 'bg-orange-500/15 text-orange-300 border-orange-500/25'},
  'entertainment':  { emoji: '⭐', label: 'Entertainment',  color: 'from-yellow-500 to-orange-500',  badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25'},
  'cloned':         { emoji: '🐑', label: 'Cloned',         color: 'from-green-500 to-emerald-500',  badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'},
  'custom':         { emoji: '✨', label: 'Custom',         color: 'from-violet-500 to-purple-500',  badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25'},
};

const BAR_COUNT = 16;

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function drawMiniBars(canvas, heights, isActive) {
  if (!canvas || !canvas.width || !canvas.height) return;
  const ctx   = canvas.getContext('2d');
  const dpr   = window.devicePixelRatio || 1;
  const count = heights.length;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = canvas.width  / dpr;
  const h = canvas.height / dpr;
  ctx.clearRect(0, 0, w, h);

  const gap      = 2;
  const barWidth = Math.max(1, (w - gap * (count - 1)) / count);

  if (isActive) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#a78bfa');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = 'rgba(100,116,139,0.30)';
  }

  for (let i = 0; i < count; i++) {
    const barH = Math.max(2, (heights[i] / 100) * h);
    const x    = i * (barWidth + gap);
    const y    = h - barH;
    const r    = Math.min(barWidth / 2, 1.5);
    ctx.beginPath();
    if (barH > r * 2) {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      ctx.rect(x, y, barWidth, barH);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// Staggered per-bar pulse — drawn every RAF frame with current time
function drawShimmerBars(canvas, heights, t) {
  if (!canvas || !canvas.width || !canvas.height) return;
  const ctx   = canvas.getContext('2d');
  const dpr   = window.devicePixelRatio || 1;
  const count = heights.length;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = canvas.width  / dpr;
  const h = canvas.height / dpr;
  ctx.clearRect(0, 0, w, h);

  const gap      = 2;
  const barWidth = Math.max(1, (w - gap * (count - 1)) / count);

  for (let i = 0; i < count; i++) {
    // Each bar pulses at a slightly different phase → wave-like shimmer
    const alpha = 0.12 + Math.abs(Math.sin(t * 1.6 + i * 0.22)) * 0.25;
    ctx.fillStyle = `rgba(139,92,246,${alpha.toFixed(3)})`;

    const barH = Math.max(2, (heights[i] / 100) * h);
    const x    = i * (barWidth + gap);
    const y    = h - barH;
    const r    = Math.min(barWidth / 2, 1.5);
    ctx.beginPath();
    if (barH > r * 2) {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      ctx.rect(x, y, barWidth, barH);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceCard({ voice, selectedVoiceId, onSelectVoice }) {
  // ─── Refs ────────────────────────────────────────────────────────────────
  const audioRef       = useRef(new Audio());
  const canvasRef      = useRef(null);
  const audioCtxRef    = useRef(null);
  const analyserRef    = useRef(null);
  const rafRef         = useRef(null);
  const liveRef        = useRef(null);
  const activeRef      = useRef(false);   // true = analysis RAF running
  const shimmerRef     = useRef(false);   // true = shimmer RAF running
  const analysisModeRef = useRef('none'); // 'none' | 'real' | 'procedural'

  // ─── State ───────────────────────────────────────────────────────────────
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);

  const idleHeight = useMemo(() => generateBarHeights(BAR_COUNT), []);

  // ─── Init live heights ───────────────────────────────────────────────────
  useEffect(() => {
    liveRef.current = [...idleHeight];
  }, [idleHeight]);

  // ─── Canvas resize observer ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawMiniBars(canvas, liveRef.current || idleHeight, activeRef.current);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
  }, [idleHeight]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const cancelRaf = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const stopAll = useCallback(() => {
    activeRef.current  = false;
    shimmerRef.current = false;
    cancelRaf();
  }, []);

  // ─── Fade bars back to idle organic shape ────────────────────────────────
  const fadeToIdle = useCallback(() => {
    stopAll();
    const live   = liveRef.current;
    const canvas = canvasRef.current;
    const tick   = () => {
      let settled = true;
      for (let i = 0; i < BAR_COUNT; i++) {
        const diff = idleHeight[i] - live[i];
        if (Math.abs(diff) > 0.25) { live[i] += diff * 0.14; settled = false; }
        else live[i] = idleHeight[i];
      }
      drawMiniBars(canvas, live, false);
      rafRef.current = settled ? null : requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [idleHeight, stopAll]);

  // ─── Shimmer loop — plays while audio is buffering ───────────────────────
  const startShimmer = useCallback(() => {
    stopAll();
    shimmerRef.current = true;
    const canvas = canvasRef.current;
    const tick   = () => {
      if (!shimmerRef.current) return;
      drawShimmerBars(canvas, idleHeight, performance.now() / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [idleHeight, stopAll]);

  // ─── Analysis / procedural loop ──────────────────────────────────────────
  const startAnalysis = useCallback((forceProceduralMode = false) => {
    stopAll();
    const live   = liveRef.current;
    const canvas = canvasRef.current;
    activeRef.current = true;

    if (forceProceduralMode || !analyserRef.current) {
      const tick = () => {
        if (!activeRef.current) return;
        const t = performance.now() / 1000;
        for (let i = 0; i < BAR_COUNT; i++) {
          const phase  = (i / BAR_COUNT) * Math.PI * 4;
          const base   = idleHeight[i];
          const target = Math.max(8, Math.min(96,
            base +
            Math.sin(t * 2.1  + phase * 0.8) * 24 +
            Math.sin(t * 1.35 + phase * 1.4) * 15 +
            Math.sin(t * 3.8  + phase * 0.5) * 9  +
            Math.cos(t * 1.9  + phase * 2.1) * 6,
          ));
          const rate = target > live[i] ? 0.55 : 0.22;
          live[i]    = live[i] + (target - live[i]) * rate;
        }
        drawMiniBars(canvas, live, true);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const analyser      = analyserRef.current;
    const timeData      = new Float32Array(analyser.fftSize);
    const samplesPerBar = Math.floor(analyser.fftSize / BAR_COUNT);
    const tick          = () => {
      if (!activeRef.current) return;
      analyser.getFloatTimeDomainData(timeData);
      for (let i = 0; i < BAR_COUNT; i++) {
        const start = i * samplesPerBar;
        let sumSq   = 0;
        for (let s = start; s < start + samplesPerBar; s++) sumSq += timeData[s] * timeData[s];
        const rms    = Math.sqrt(sumSq / samplesPerBar);
        const target = 6 + Math.min(1, rms * 4.5) * 89;
        const rate   = target > live[i] ? 0.88 : 0.55;
        live[i]      = live[i] + (target - live[i]) * rate;
      }
      drawMiniBars(canvas, live, true);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [idleHeight, stopAll]);

  // ─── Audio element events ────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;

    // Fired when playback actually starts (after any buffering)
    const onPlaying = () => {
      setIsLoading(false);
      shimmerRef.current = false;
      // Start the appropriate waveform loop based on mode set before play()
      if (analysisModeRef.current === 'real') {
        startAnalysis(false);
      } else if (analysisModeRef.current === 'procedural') {
        startAnalysis(true);
      }
    };

    // Fired when playback stalls waiting for data (e.g. slow network)
    const onWaiting = () => {
      setIsLoading(true);
      stopAll();
      startShimmer();
    };

    // Fired when playback finishes
    const onEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
      analysisModeRef.current = 'none';
      stopAll();
      fadeToIdle();
    };

    // Fired on load/playback error
    const onError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      analysisModeRef.current = 'none';
      stopAll();
      fadeToIdle();
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('ended',   onEnded);
    audio.addEventListener('error',   onError);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('ended',   onEnded);
      audio.removeEventListener('error',   onError);
    };
  }, [startAnalysis, startShimmer, stopAll, fadeToIdle]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAll();
      audioRef.current.pause();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, [stopAll]);

  // ─── AudioContext setup ──────────────────────────────────────────────────
  const initAudioContext = useCallback(async () => {
    const audio = audioRef.current;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx  = window.AudioContext || window['webkitAudioContext'];
        const ctx       = new AudioCtx();
        const analyser  = ctx.createAnalyser();
        analyser.fftSize               = 2048;
        analyser.smoothingTimeConstant = 0;
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
      if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
      return true;
    } catch (err) {
      console.warn('VoiceCard: Web Audio unavailable —', err.message);
      return false;
    }
  }, []);

  const isCrossOrigin = useCallback(() => {
    const src = voice.audio;
    if (!src) return false;
    try { return new URL(src).origin !== window.location.origin; }
    catch { return false; }
  }, [voice.audio]);

  // ─── Play / Pause ────────────────────────────────────────────────────────
  const handlePlayPause = useCallback(async (e) => {
    e.stopPropagation();

    if (isPlaying || isLoading) {
      // Stop — cancel load or playing
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
      analysisModeRef.current = 'none';
      stopAll();
      fadeToIdle();
      return;
    }

    // No audio URL: run procedural demo for 3 s
    if (!voice.audio) {
      setIsPlaying(true);
      analysisModeRef.current = 'procedural';
      startAnalysis(true);
      setTimeout(() => {
        setIsPlaying(false);
        analysisModeRef.current = 'none';
        stopAll();
        fadeToIdle();
      }, 3000);
      return;
    }

    if (audioRef.current.src !== voice.audio) audioRef.current.src = voice.audio;

    // Show loading state immediately if audio isn't ready yet
    const needsBuffering = audioRef.current.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
    if (needsBuffering) {
      setIsLoading(true);
      startShimmer();
    }

    const crossOrigin = isCrossOrigin();
    if (crossOrigin) {
      // Set mode BEFORE play() — 'playing' event handler reads this
      analysisModeRef.current = 'procedural';
      try {
        await audioRef.current.play();
      } catch {
        setIsLoading(false);
        stopAll();
        fadeToIdle();
        return;
      }
    } else {
      const ok = await initAudioContext();
      analysisModeRef.current = ok ? 'real' : 'procedural';
      try {
        await audioRef.current.play();
      } catch {
        setIsLoading(false);
        stopAll();
        fadeToIdle();
        return;
      }
    }

    setIsPlaying(true);
    // Waveform loop starts in the 'playing' event handler once audio is audible
  }, [isPlaying, isLoading, voice.audio, isCrossOrigin, initAudioContext,
      startAnalysis, startShimmer, stopAll, fadeToIdle]);

  // ─── Render ──────────────────────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);
  const categoryInfo = voiceCategories[voice.type] || { emoji: '🎤', label: 'Voice', color: 'from-slate-500 to-slate-600', badge: 'bg-slate-500/15 text-slate-300 border-slate-500/25' };
  const isSelected   = selectedVoiceId === voice.id;
  const showDesc     = (isHovered || isSelected) && voice.description;

  return (
    <motion.div
      onClick={() => onSelectVoice(voice.id, voice.name, voice.type, voice.audio || '')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-3 rounded-xl border cursor-pointer transition-all overflow-hidden",
        isSelected
          ? 'border-violet-500 bg-gradient-to-br from-violet-500/20 to-purple-500/10 shadow-lg shadow-violet-500/20'
          : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80',
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-2">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br",
          categoryInfo.color,
        )}>
          {voice.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 pr-5">
          <h4 className="font-medium text-white text-sm truncate leading-tight">{voice.name}</h4>
          {/* Category pill */}
          <span className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium border mt-0.5",
            categoryInfo.badge,
          )}>
            {categoryInfo.emoji} {categoryInfo.label}
          </span>
        </div>
      </div>

      {/* Description — visible on hover or when selected */}
      <AnimatePresence>
        {showDesc && (
          <motion.p
            key="desc"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
            exit={{   opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "text-[11px] leading-snug px-1 truncate",
              isSelected ? 'text-violet-300' : 'text-slate-400',
            )}
          >
            {voice.description}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Canvas waveform + play button */}
      <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
        <canvas
          ref={canvasRef}
          className="flex-1 h-5 block"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={handlePlayPause}
          title={isLoading ? 'Loading…' : isPlaying ? 'Pause' : 'Play'}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all",
            isPlaying || isLoading
              ? "bg-violet-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white",
          )}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3 ml-0.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
