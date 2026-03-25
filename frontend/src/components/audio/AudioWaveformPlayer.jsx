import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

// Organic idle heights — shared with DisabledWaveform for visual continuity
export function generateBarHeights(count) {
  return Array.from({ length: count }, (_, i) => {
    const h =
      50 +
      Math.sin(i * 0.47) * 18 +
      Math.cos(i * 0.91) * 14 +
      Math.sin(i * 1.73) * 9  +
      Math.cos(i * 2.31) * 6  +
      Math.sin(i * 3.14 + 1.2) * 4;
    return Math.max(10, Math.min(90, h));
  });
}

function formatTime(s) {
  const m   = Math.floor((s || 0) / 60);
  const sec = Math.floor((s || 0) % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Draw rounded-top bars on canvas. Works in CSS-pixel space.
function drawBarsOnCanvas(canvas, heights, isActive) {
  if (!canvas || !canvas.width || !canvas.height) return;
  const ctx    = canvas.getContext('2d');
  const dpr    = window.devicePixelRatio || 1;
  const count  = heights.length;

  // Always reset to DPR-scaled transform so drawing coords = CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = canvas.width  / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);

  const gap      = 2.5;
  const barWidth = Math.max(1, (w - gap * (count - 1)) / count);
  const radius   = Math.min(barWidth / 2, 3);

  // Single gradient for all bars — top-of-canvas = pink, bottom = violet
  if (isActive) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#db2777');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = 'rgba(100,116,139,0.22)';
  }

  for (let i = 0; i < count; i++) {
    const barH = Math.max(2, (heights[i] / 100) * h);
    const x    = i * (barWidth + gap);
    const y    = h - barH;

    ctx.beginPath();
    if (barH > radius * 2) {
      // Rounded top corners only
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
      ctx.rect(x, y, barWidth, barH);
    }
    ctx.closePath();
    ctx.fill();
  }
}

export default function AudioWaveformPlayer({ audioUrl, duration, compact = false }) {
  // ─── Refs ──────────────────────────────────────────────────────────────────
  const audioRef     = useRef(null);
  const canvasRef    = useRef(null);
  const audioCtxRef  = useRef(null);
  const analyserRef  = useRef(null);
  const rafRef       = useRef(null);
  const liveRef      = useRef(null);    // lerped bar heights
  const activeRef    = useRef(false);   // RAF loop guard

  // ─── State ─────────────────────────────────────────────────────────────────
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [curTime,  setCurTime]  = useState(0);
  const [totalDur, setTotalDur] = useState(duration || 0);

  const barCount   = compact ? 34 : 50;
  const idleHeight = useMemo(() => generateBarHeights(barCount), [barCount]);

  // ─── Init live heights + draw idle state ───────────────────────────────────
  useEffect(() => {
    liveRef.current = [...idleHeight];
    drawBarsOnCanvas(canvasRef.current, idleHeight, false);
  }, [idleHeight]);

  // ─── Resize observer — keeps canvas sharp at every DPR/size ───────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect    = canvas.getBoundingClientRect();
      const dpr     = window.devicePixelRatio || 1;
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawBarsOnCanvas(canvas, liveRef.current || idleHeight, activeRef.current);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
  }, [idleHeight]); // eslint-disable-line

  // ─── Audio element events ──────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime  = () => {
      setCurTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta  = () => setTotalDur(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurTime(0);
      activeRef.current = false;
      cancelRaf();
      fadeToIdle();
    };

    audio.addEventListener('timeupdate',     onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended',          onEnded);
    return () => {
      audio.removeEventListener('timeupdate',     onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended',          onEnded);
    };
  }, [audioUrl]); // eslint-disable-line

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const cancelRaf = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const fadeToIdle = useCallback(() => {
    cancelRaf();
    activeRef.current = false;
    const live = liveRef.current;
    const idle = idleHeight;
    const canvas = canvasRef.current;

    const tick = () => {
      let settled = true;
      for (let i = 0; i < barCount; i++) {
        const diff = idle[i] - live[i];
        if (Math.abs(diff) > 0.25) { live[i] += diff * 0.14; settled = false; }
        else live[i] = idle[i];
      }
      drawBarsOnCanvas(canvas, live, false);
      rafRef.current = settled ? null : requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [barCount, idleHeight]);

  // ─── Analysis / procedural loop ────────────────────────────────────────────
  const startAnalysis = useCallback((forceProceduralMode = false) => {
    const live   = liveRef.current;
    const canvas = canvasRef.current;
    activeRef.current = true;

    // ── Procedural fallback (cross-origin or no AudioContext) ───────────────
    if (forceProceduralMode || !analyserRef.current) {
      const tick = () => {
        if (!activeRef.current) return;
        const t = performance.now() / 1000;
        for (let i = 0; i < barCount; i++) {
          const phase  = (i / barCount) * Math.PI * 4;
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
        drawBarsOnCanvas(canvas, live, true);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── True real-time analysis using getFloatTimeDomainData ────────────────
    // Uses raw PCM samples (smoothingTimeConstant = 0) so the waveform
    // responds instantly to every amplitude change without Web Audio lag.
    const analyser      = analyserRef.current;
    const fftSize       = analyser.fftSize;          // 2048 samples
    const timeData      = new Float32Array(fftSize);
    const samplesPerBar = Math.floor(fftSize / barCount);

    const tick = () => {
      if (!activeRef.current) return;

      // Raw PCM from the audio buffer — no smoothing applied
      analyser.getFloatTimeDomainData(timeData);

      for (let i = 0; i < barCount; i++) {
        // RMS amplitude of this bar's sample window
        // RMS captures both loudness and dynamics accurately
        const start = i * samplesPerBar;
        let sumSq   = 0;
        for (let s = start; s < start + samplesPerBar; s++) {
          sumSq += timeData[s] * timeData[s];
        }
        const rms = Math.sqrt(sumSq / samplesPerBar);

        // Silence ≈ 0.00001–0.0001, speech ≈ 0.01–0.15, loud ≈ 0.3–1.0
        // Amplify then clamp so quiet signals are still visible
        const scaled = Math.min(1, rms * 4.5);
        const target = 6 + scaled * 89;  // maps to 6–95% height

        // Asymmetric lerp — near-instant attack, moderate release
        // This is NOT for smoothing lag; it just prevents single-sample
        // spikes from causing visual jitter between frames
        const rate = target > live[i] ? 0.88 : 0.55;
        live[i]    = live[i] + (target - live[i]) * rate;
      }

      drawBarsOnCanvas(canvas, live, true);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [barCount, idleHeight]);

  // ─── AudioContext setup ────────────────────────────────────────────────────
  const initAudioContext = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx  = window.AudioContext || window['webkitAudioContext'];
        const ctx       = new AudioCtx();
        const analyser  = ctx.createAnalyser();
        analyser.fftSize               = 2048; // high time resolution (2048 PCM samples)
        analyser.smoothingTimeConstant = 0;    // NO smoothing — every frame is raw data
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      return true;
    } catch (err) {
      console.warn('AudioWaveformPlayer: Web Audio unavailable —', err.message);
      return false;
    }
  }, []);

  // Cross-origin detection — skip Web Audio for external URLs (CORS safe)
  const isCrossOrigin = useCallback(() => {
    try { return new URL(audioUrl).origin !== window.location.origin; }
    catch { return false; }
  }, [audioUrl]);

  // ─── Play / Pause ──────────────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      activeRef.current = false;
      setPlaying(false);
      cancelRaf();
      fadeToIdle();
    } else {
      if (isCrossOrigin()) {
        // External audio: play natively, drive waveform procedurally
        try { await audio.play(); } catch { return; }
        setPlaying(true);
        cancelRaf();
        startAnalysis(true);
      } else {
        // Same-origin: full Web Audio real-time analysis
        const ok = await initAudioContext();
        try { await audio.play(); } catch { return; }
        setPlaying(true);
        cancelRaf();
        startAnalysis(!ok);
      }
    }
  }, [playing, isCrossOrigin, initAudioContext, startAnalysis, fadeToIdle]);

  // ─── Seek ──────────────────────────────────────────────────────────────────
  const seek = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  }, []);

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      activeRef.current = false;
      cancelRaf();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []); // eslint-disable-line

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-0.5' : 'py-1'}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play / Pause button */}
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className={`relative flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300
          ${compact ? 'w-8 h-8' : 'w-10 h-10'}
          ${playing
            ? 'bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/50'
            : 'bg-slate-800 border border-slate-600/60 hover:border-violet-500/50 hover:bg-slate-700'
          }`}
      >
        {playing
          ? <Pause className={`text-white ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          : <Play  className={`text-slate-300 ml-0.5 ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        }
        {playing && (
          <motion.span
            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-violet-400/30 pointer-events-none"
          />
        )}
      </motion.button>

      {/* Canvas waveform — drawn imperatively, zero React re-renders per frame */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <canvas
          ref={canvasRef}
          onClick={seek}
          className={`w-full cursor-pointer block ${compact ? 'h-7' : 'h-10'}`}
        />

        {!compact && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono tabular-nums w-8 flex-shrink-0">
              {formatTime(curTime)}
            </span>
            <div
              className="flex-1 h-[3px] bg-slate-700/60 rounded-full overflow-hidden cursor-pointer"
              onClick={seek}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono tabular-nums w-8 text-right flex-shrink-0">
              {formatTime(totalDur)}
            </span>
          </div>
        )}
      </div>

      {compact && (
        <span className="text-[10px] text-slate-500 font-mono tabular-nums flex-shrink-0">
          {formatTime(curTime)}/{formatTime(totalDur)}
        </span>
      )}
    </div>
  );
}
